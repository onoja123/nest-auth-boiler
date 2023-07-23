export async function generateOTP() {
    return Math.floor(Math.random() * 900000).toString()
}