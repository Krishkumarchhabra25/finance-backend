const wallet = require("../models/WalletModel");


exports.createAccountWallet = async(req,res)=>{
try {
    const {name , type , balances , account_number , routing_number , isActive , currency} = req.body;

      if (!name || !type || !balances || !account_number || !routing_number) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existingWalletAccount = await wallet.findOne({account_number});
    if(existingWalletAccount){
        res.status(409).json({message: "Account number already exist"});
    }

    const newWallet = new wallet({
      userId: req.user?._id,
      name,
      type,
      balances,
      account_number,
      routing_number,
      isActive: isActive ?? true,
      currency: currency ?? "INR",
    });
    const savedWallet = await newWallet.save(); 

  return res.status(201).json({
  message: "Wallet account created successfully",
  data: savedWallet,
});
} catch (error) {
      console.error("Error creating wallet:", error);
    return res.status(500).json({ message: "Server error while creating wallet." });
}

}

exports.getAllWalletsAccount = async(req,res)=>{

    try {
         const userId = req.user?._id;

    if(!userId){
        return res.status(401).json({message: "unauthorized: user id missing"})
    };

    const wallets = await wallet.find({userId})
       .select("-_v")
       .lean();


       return res.status(201).json({
        message: "Wllets account fetched successfully",
        count: wallets.length,
        data:wallets
       })
    } catch (error) {
        console.error("Error fetching wallets:", error);
    return res.status(500).json({ message: "Server error while fetching wallets." });
    }
   
}

exports.editWalletAccount = async(req,res)=>{
    try {
        const walletId = req.params.id
        const userId = req.user?._id

        if(!walletId){
            return res.status(400).json({message:"Wallet Id is required"});
        };

        const existingWallet = await wallet.findOne({_id:walletId , userId});

        if(!existingWallet){
            return res.status(400).json({message: "wallet not found or access denied"})
        };

        const allowUpdates =[
            "name",
            "type",
            "balances",
            "account_number",
            "routing_number",
            "isActive",
            "currency"
        ];


          const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) =>
        allowUpdates.includes(key)
      )
    );


        const updateWallet = await wallet.findByIdAndUpdate(
            walletId,
            {$set:updates},
            {new:true , runValidators:true}
        );

         return res.status(200).json({
      success: true,
      status: "success",
      message: "Wallet account updated successfully.",
      wallet: updateWallet,
    });
    } catch (error) {
            console.error("Error updating wallet:", error);
    return res.status(500).json({
      success: false,
      status: "failed",
      error: "Failed to update wallet.",
      details: error.message,
    });

    }
}

exports.getWalletDetails = async (req, res) => {
  try {
    const walletId = req.params.id;

    if (!walletId) {
      return res.status(400).json({ message: "Wallet ID is required." });
    }

    const Wallet = await wallet.findById(walletId);

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found." });
    }

    return res.status(200).json({
      success: true,
      status: "success",
      message: "Wallet details fetched successfully.",
      data: Wallet,
    });
  } catch (error) {
    console.error("Error fetching wallet details:", error);
    return res.status(500).json({
      success: false,
      status: "failed",
      error: "Failed to fetch wallet details.",
      details: error.message,
    });
  }
};


exports.deleteWalletAccount = async (req, res) => {
  try {
    const walletId = req.params.id;
    const userId = req.user?._id;

    if (!walletId) {
      return res.status(400).json({ message: "Wallet ID is required." });
    }

    const Wallet = await wallet.findOneAndDelete({ _id: walletId, userId });

    if (!Wallet) {
      return res.status(404).json({ message: "Wallet not found or access denied." });
    }

    return res.status(200).json({
      success: true,
      status: "success",
      message: "Wallet account deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting wallet:", error);
    return res.status(500).json({
      success: false,
      status: "failed",
      error: "Failed to delete wallet.",
      details: error.message,
    });
  }
};
