const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5001 ;
const fs = require('fs');
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const path = require('path')
const multer = require('multer')

const UPLOADS = './uploads/'

app.use(cors());
app.use(express.json())


const CLIENT_ID = '920870880600-s7nl7jntc2k011gurm7q1pnr9v3e8irj.apps.googleusercontent.com' 
const CLIENT_SECRET = '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'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04bugOaS1kaivCgYIARAAGAQSNwF-L9IrmvraomCTzkSPmLnmfJMGm6P3dRyPMwzrFbBiSuEV4AXA3aodtYgvCUklSxiUo5y4Sf0'


const oAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET, REDIRECT_URI )
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN})

async function sendMail({email, name , message , filesname }){
   
   try {
      const accessToken = await oAuth2Client.getAccessToken()
      const transport = nodemailer.createTransport({
         service : 'gmail',
         auth : {
            type : 'OAuth2',
            user : 'ahad.devops@gmail.com',
            clientId : CLIENT_ID,
            clientSecret : CLIENT_SECRET,
            refreshToken : REFRESH_TOKEN,
            accessToken : accessToken
         }
      })
       const mailOptions = {
         from : email, 
         to : 'jehad0160@gmail.com',
         replyTo : `${name} , ${email}`,
         subject : `New Message from ${name}` ,
         text : `This is Message`,
         html : `<body></h1>${message}</h1> <br /> <small>this is a query message for teximco BD</small></body>`,
         attachments: [
            {
               filename: filesname,
               path: `uploads\\${filesname}`,
            }
        ]
      }
      const result = await transport.sendMail(mailOptions)
      return  result
      
   } catch (error) {
      return error
   }
}

const storage = multer.diskStorage({
   destination : (req , file , cb)=>{
      cb(null , UPLOADS)
   },
   filename : (req , file , cb)=>{
      const fileExtention = path.extname(file.originalname);
      const fileName = file.originalname
                           .replace(fileExtention, "")
                           .toLowerCase()
                           .split(' ')
                           .join("-") + "-" + Date.now()
   cb(null , fileName + fileExtention)
   }
})

const uploads = multer({
   storage : storage
})


// delete in folder 
async function deleteF(){
  
var folder = './uploads/';
   
fs.readdir(folder, (err, files) => {
  if (err) throw err;
  
  for (const file of files) {
      fs.unlinkSync(folder+file);
  }
  
});
}


app.post('/contacts', uploads.array('attachment' , 5 ) , async(req,res , next)=>{
   const email = req.body.email;
   const name = req.body.name;
   const message = req.body.message;
   console.log("a" ,email, name, message)
   const filesname = req?.files[0]?.filename;
   console.log(req)
   await sendMail({email , name , message , filesname })
   res.redirect('http://localhost:3000/contact')
   next();
})

app.get('/delete', async(req,res)=>{
   deleteF()
})

app.get('/' , (req , res)=>{
   res.send('Teximco BD')
})


app.listen(port , ()=>{
   console.log('teximco db ')
})