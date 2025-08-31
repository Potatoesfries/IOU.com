import { User } from "../model/user.model.js";

export const authCallBack = async (req, res, next) => {

    try {
        const {id, firstName, lastName, imageUrl, emailAddresses, username} = req.body;
        
        const primaryEmail = emailAddresses?.[0]?.emailAddress;

        //  we check if user already exist 
        const user = await User.findOne({clerkId: id.trim(),});

        // Generate username if not provided
        const userNameToUse = username || `user_${id.slice(-8)}` || primaryEmail?.split('@')[0] || 'anonymous';

        //  if user is not found then it create new user 

        if(!user){
            const newUser  = await User.create({
                fullName: `${firstName || ''} ${lastName || ''}`.trim(),
                imageUrl: imageUrl,
                clerkId: id,
                email: primaryEmail,
                userName: userNameToUse
            })
        } else{
            user.fullName = `${firstName || ''} ${lastName || ''}`.trim();
            user.imageUrl = imageUrl;
            user.email = primaryEmail;
            user.userName = userNameToUse;
            await user.save();
        }
    

        res.status(200).json({success: true})

    } catch (error) {
        console.log("error in creating user")
        next(error)
    }

}