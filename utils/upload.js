

module.exports={
    
  uploadSingleFile: function(req,res){
    let img = req.file.location
    res.status(200).json({img});
  },

  uploadMultipleFile: function (req,res){
    let img = [];

    if(req.files.length > 0){
        img = req.files.map((file)=>{
            return {
                img: file.location
            };
        });
        res.status(200).json(img)
    }
  }
}