export function getOtpEmailTemplate(
  otp: string,
  expirationMinutes: number = 10,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 20px 0; text-align: center;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h1 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Your OTP Code</h1>
              <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                Use the following code to complete your request:
              </p>
              <div style="background-color: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                  ${otp}
                </p>
              </div>
              <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
                This code will expire in <strong>${expirationMinutes} minutes</strong>.
              </p>
              <p style="color: #999999; font-size: 12px; line-height: 1.5; margin: 30px 0 0 0;">
                If you didn't request this code, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

