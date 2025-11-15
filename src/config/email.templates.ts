//
// email.template.ts
// 
// Created by Ahmed Moussa, 15/11/2025
//

const EMAIL_STYLES = `
  body {
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
    font-family: Arial, Helvetica, sans-serif;
  }
  .email-wrapper {
    background-color: #f4f4f4;
  }
  .email-container {
    max-width: 600px;
    width: 100%;
    background-color: #ffffff;
    border-radius: 8px;
  }
  .email-content {
    padding: 40px 30px;
    text-align: center;
  }
  .email-title {
    margin: 0 0 20px 0;
    font-size: 24px;
    color: #333333;
    font-weight: bold;
  }
  .email-text {
    margin: 0 0 30px 0;
    font-size: 16px;
    line-height: 1.5;
    color: #666666;
  }
  .button-wrapper {
    border-radius: 4px;
    background-color: #007bff;
  }
  .button {
    display: inline-block;
    padding: 14px 40px;
    font-size: 16px;
    color: #ffffff;
    text-decoration: none;
    font-weight: bold;
  }
  .email-footer {
    margin: 30px 0 0 0;
    font-size: 14px;
    line-height: 1.5;
    color: #999999;
  }
`;

const createEmailTemplate = (title, bodyContent) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style type="text/css">${EMAIL_STYLES}</style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="email-wrapper">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container">
          <tr>
            <td class="email-content">
              ${bodyContent}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Account creation body content
const ACCOUNT_CREATION_BODY = `
  <h1 class="email-title">Welcome, {{USERNAME}}!</h1>
  <p class="email-text">Thank you for creating an account. Please validate your email address to get started.</p>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
    <tr>
      <td class="button-wrapper">
        <a href="{{VALIDATION_LINK}}" target="_blank" class="button">Validate My Account</a>
      </td>
    </tr>
  </table>
  <p class="email-footer">If you didn't create this account, please ignore this email.</p>
`;

// Password reset body content
const PASSWORD_RESET_BODY = `
  <h1 class="email-title">Password Reset Request</h1>
  <p class="email-text">Hi {{USERNAME}}, we received a request to reset your password for {{EMAIL}}.</p>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
    <tr>
      <td class="button-wrapper">
        <a href="{{RESET_LINK}}" target="_blank" class="button">Reset My Password</a>
      </td>
    </tr>
  </table>
  <p class="email-footer">If you didn't request this, please ignore this email. This link expires in 24 hours.</p>
`;

const ACCOUNT_CREATION_TEMPLATE = createEmailTemplate('Validate Your Account', ACCOUNT_CREATION_BODY);
const PASSWORD_RESET_TEMPLATE = createEmailTemplate('Reset Your Password', PASSWORD_RESET_BODY);

export default {
  ACCOUNT_CREATION_TEMPLATE,
  PASSWORD_RESET_TEMPLATE
};