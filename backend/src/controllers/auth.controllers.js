
import { User } from "../model/user.model.js";

export const authCallBack = async (req, res, next) => {
    try {
        const {id, firstName, lastName, imageUrl, emailAddresses, username} = req.body;
        
        const primaryEmail = emailAddresses?.[0]?.emailAddress;

        // we check if user already exist 
        const user = await User.findOne({clerkId: id.trim(),});

        // Generate username if not provided
        const userNameToUse = username || `user_${id.slice(-8)}` || primaryEmail?.split('@')[0] || 'anonymous';

        // if user is not found then it create new user 
        if(!user){
            const newUser = await User.create({
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

// Add this new function for updating profile
export const updateProfile = async (req, res) => {
    try {
        const { fullName, clerkId } = req.body;

        if (!clerkId) {
            return res.status(400).json({ message: "Clerk ID is required" });
        }

        const user = await User.findOne({ clerkId: clerkId.trim() });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update full name if provided
        if (fullName) {
            user.fullName = fullName.trim();
        }

        // Update profile image if uploaded
        if (req.file) {
            user.imageUrl = req.file.path;
        }

        const updatedUser = await user.save();
        
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                fullName: updatedUser.fullName,
                imageUrl: updatedUser.imageUrl,
                email: updatedUser.email,
                userName: updatedUser.userName
            }
        });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: error.message });
    }
};