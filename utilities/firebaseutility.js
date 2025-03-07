const { storage } = require("../config/firebaseConfig"); 

async function uploadFileToFirebase(file) {
  try {
    const fileName = `${Date.now()}-${file.originalname}`;
    
    const fileRef = storage.file(fileName);

    await fileRef.save(file.buffer, {
      contentType: file.mimetype,
      public: true, 
    });

    const fileUrl = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2491', 
    });

    
    return fileUrl[0];

  } catch (error) {
    console.error("Error uploading file to Firebase: ", error);
    throw new Error("Error uploading file to Firebase");
  }
}



module.exports = { uploadFileToFirebase };
