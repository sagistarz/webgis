export const fetchAODData = async () => {
  try {
    const response = await fetch("https://4655-180-252-95-112.ngrok-free.app/api1/get-data-aod/");
    console.log("Response status:", response.status); // Harus 200
    console.log("Content-Type:", response.headers.get("content-type")); // Harus image/tiff

    const arrayBuffer = await response.arrayBuffer();
    console.log("Data size:", arrayBuffer.byteLength, "bytes"); // Tidak boleh 0

    return arrayBuffer;
  } catch (error) {
    console.error("Detail error:", error);
    throw error;
  }
};
