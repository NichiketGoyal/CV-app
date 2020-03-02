const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/authentication')
const router = new express.Router()

router.post('/user', async (req,res) => {
    const user = new User(req.body)
    try{
        await user.save()
        const token = await user.getAuthToken()

        res.status(201).send({user,token})
    }
    catch(e){
        res.status(400).send(''+e)
    }
})

router.post('/user/login', async(req,res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.getAuthToken()
        
        res.status(200).send({user,token})
    }catch(e){
        res.status(404).send(''+ e)
    }
    
})

router.get('/user/me',auth, async(req,res) => {
    res.send(req.user)
})

router.patch('/user/me',auth, async(req,res) =>{
    const updates = Object.keys(req.body)
    const allowed = ['name', 'password']
    const isValid = updates.every((add)=> allowed.includes(add))
    
    if(!isValid){
        return res.status(400).send('Error: Invalid updates')
    }
    try{
        
        updates.forEach(async(update)=> req.user[update] = req.body[update])

        await req.user.save()

        res.send(req.user)

    }catch(e){
        res.status(500).send(""+e)
    }
})

router.patch('/user/me/remove',auth, async(req,res) => {
    const updates = Object.keys(req.body)
    const allowed = ["education","projects","experience"]
    const isValid = updates.every((remove)=> allowed.includes(remove))
    if(!isValid){
        return res.status(400).send('Error: Invalid updates')
    }
    try{
        updates.forEach(async(remove)=>{
            var to_remove = {};
            to_remove[remove] = req.body[remove]
            await req.user.updateOne({$pull:to_remove})
        })
        res.send(req.user)
    }catch(e){res.status(500).send(""+e)}
})

router.post('/user/me',auth,async(req,res) =>{
    const add_data = Object.keys(req.body)
    const allowed = ["education","projects","experience"]
    const isValid = add_data.every((add)=> allowed.includes(add))
    
    if(!isValid){
        return res.status(400).send('Error: Invalid updates')
    }
    try{

        add_data.forEach(async (add) => {
                        
            var to_add={};
            to_add[add] = req.body[add]

            await req.user.updateOne({$addToSet:to_add})
        })

        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})

router.post('/user/logout',auth, async(req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })

        req.user.save()
        res.send('Successfully logged out')
    }catch(e){
        res.status(500).send()
    }
})

router.post('/user/logoutall',auth,async(req,res)=>{

    try{
        req.user.tokens = []
        await req.user.save()
        res.send("Successfully looged out of all sessions")
    }catch(error){
        res.status(500).send()
    }

})

router.delete('/user/me', auth, async(req,res)=>{
    try{
        req.user.remove()
        res.send(req.user)

    }catch(error){
        res.status(500).send(error)
    }
})

module.exports = router