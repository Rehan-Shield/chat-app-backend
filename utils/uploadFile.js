module.exports = async (file) => {
  const imageData = new FormData();

  const base64 = `data:${file.mimeType};base64,${file.buffer.toString(
    "base64",
  )}`;

  imageData.append("file", base64);
  imageData.append("upload_preset", process.env.UPLOAD_PRESET);
  imageData.append("cloud_name", process.env.CLOUD_NAME);

  const { url } = await (
    await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: imageData,
      },
    )
  ).json();

  return url;
};
