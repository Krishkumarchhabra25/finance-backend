
const User = require("../models/UserModel.js");
const generateToken = require("../utils/generateToken");


exports.registerUser = async(req, res)=>{

    const {name , email , password} = req.body;

    if(!name || !email || !password){
        res.status(400).json({error:"All fields are required"})
    }

    try {
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({error:"User already exist"})
        }

        const user = new User({
            name,
            email,
            password,
            provider:'local'
        });

        await user.save();

        res.status(201).json({
            user,
            token:generateToken(user)
        })
    } catch (error) {
         console.log('Resgister Successfully' , error);
         res.status(500).json({error:'Server error'})
    }
}


exports.loginUser = async(req,res)=>{
    const {email , password}= req.body;

    if(!email || !password){
        return res.status(400).json({error:"All fields are required"});
    };

    try {
        const user = await User.findOne({email});
        if(!user || user.provider !== 'local' ){
            return res.status(400).json({error:"Invalid credentials"})
        }
        const isPasswordMatch = await user.matchPassword(password);

        if(!isPasswordMatch){
            return res.status(400).json({error:"Invalid Credentials"})
        }

       return  res.status(200).json({
            user,
            token:generateToken(user)
        })
    } catch (error) {
         console.log('Resgister Successfully' , error);
        return res.status(500).json({error:'Server error'})
    }
}

exports.googleOAuthLogin = async(req,res)=>{
    const {code} = req.body;

    if(!code){
        res.status(400).json({error: "Authorization code is required"})
    }

    try {
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token" , {
            method: "POST" ,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                code,
                grant_type: "authorization_code",
                redirect_uri: process.env.GOOGLE_REDIRECT_URI
            }),
        } );

        const tokenData = await tokenResponse.json();
        if(tokenData.error || !tokenData.access_token){
            throw new Error(tokenData.error || "Token exchange failed")
        }

        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo" , {
            headers:{Authorization: `Bearer ${tokenData.access_token}`}
        })

        const userData = await userRes.json();
        const {email , name , picture} = userData;


        if(!email){
            return res.status(400).json({error: "Google account does not provide an email"})
        }

        let user = await User.findOne({email});

        if(!user){
            user = await User.create({
                email,
                name,
                avatar: picture,
                provider: 'google',
                password: '' 
            });
        }

        res.status(200).json({
            user,
            token:generateToken(user)
        })
    } catch (error) {
        console.error('Google OAuth Error:', error);
        res.status(500).json({ error: 'Google login failed' });
    }
}


exports.githubOAuthLogin = async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "Authorization code is required" });
    }

    try {
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: 'POST',
            headers: {
                "Accept": "application/json",  // ✅ IMPORTANT: Needed to get JSON response instead of URL encoded
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
            throw new Error(tokenData.error || "Token exchange failed");
        }

        const { access_token } = tokenData;

        // Get user basic info
        const userRes = await fetch("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const userData = await userRes.json();
        if (!userRes.ok) {
            throw new Error(userData.message || "Failed to fetch user info");
        }

        let { name, email, avatar_url } = userData;

        // If email is missing, fetch from /user/emails
        if (!email) {
            const emailRes = await fetch("https://api.github.com/user/emails", {
                headers: { Authorization: `Bearer ${access_token}` }
            });
            const emails = await emailRes.json();
            const primaryEmail = emails.find(e => e.primary && e.verified);
            email = primaryEmail?.email;
        }

        if (!email) {
            return res.status(400).json({ error: "GitHub account does not provide an email" });
        }

        // Find or create user in DB
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                email,
                name,
                avatar: avatar_url,
                provider: 'github',
                password: ''  // no password for social login
            });
        }

        res.status(200).json({
            user,
            token: generateToken(user)
        });

    } catch (error) {
        console.error('GitHub OAuth Error:', error.message);
        res.status(500).json({ error: 'GitHub login failed' });
    }
};
