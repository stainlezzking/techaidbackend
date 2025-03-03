import speakeasy from "speakeasy";
import QRCode from "qrcode";

export const generate2FACode = function () {
  //
  const { base32 } = speakeasy.generateSecret();
  return {
    secret: base32,
    encoding: "base32",
  };
};

export const verify2FAToken = function (secret: string, token: string) {
  const valid = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2,
  });
  return valid;
};

export const generateQrcodeURL = async function (secret: string) {
  const qrcodeURL = await QRCode.toDataURL("otpauth://totp/TechAid?secret=" + secret);
  return qrcodeURL;
};
