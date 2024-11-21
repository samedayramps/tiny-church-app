export const welcomeEmailTemplate = (email: string) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Welcome to Tiny Church</title>
  <!--[if mso]>
  <style type="text/css">
    table,td,div,p,a,span {font-family: Arial, sans-serif !important;}
    table {border-collapse: collapse !important;}
    .button-td { background: none !important; border: none !important; }
    .button-td a { border: 1px solid #4F46E5 !important; padding: 12px 24px !important; }
  </style>
  <![endif]-->
  <style>
    /* Base */
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      min-width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      line-height: 1.5;
      background-color: #f6f9fc;
      color: #2d3748;
    }
    
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    
    /* Container */
    .email-wrapper {
      width: 100%;
      margin: 0;
      padding: 20px 0;
      background-color: #f6f9fc;
    }
    
    .email-content {
      width: 100%;
      max-width: 570px;
      margin: 0 auto;
    }
    
    /* Body */
    .email-body {
      background-color: #ffffff;
      border: 1px solid #e8e5ef;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      margin: 0 auto;
      padding: 0;
      width: 100%;
      max-width: 570px;
    }
    
    .email-body_inner {
      background-color: #ffffff;
      padding: 30px;
    }
    
    /* Typography */
    h1 {
      color: #1a202c;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 20px;
      text-align: left;
    }
    
    p {
      color: #4a5568;
      font-size: 16px;
      line-height: 1.625;
      margin: 0 0 20px;
    }
    
    ul {
      color: #4a5568;
      font-size: 16px;
      line-height: 1.625;
      margin: 0 0 20px;
      padding-left: 20px;
    }
    
    /* Buttons */
    .button {
      display: inline-block;
      background-color: #000000;
      border-radius: 4px;
      color: #ffffff !important;
      font-size: 16px;
      font-weight: 600;
      line-height: 1;
      padding: 12px 24px;
      text-decoration: none;
      text-align: center;
      -webkit-text-size-adjust: none;
    }
    
    /* MSO button override */
    <!--[if mso]>
    <style type="text/css">
      .button-td a { 
        border: 1px solid #000000 !important; 
        background-color: #000000 !important;
        color: #ffffff !important;
      }
    </style>
    <![endif]-->
    
    /* Dark mode button override */
    @media (prefers-color-scheme: dark) {
      .button {
        background-color: #ffffff !important;
        color: #000000 !important;
      }
    }
    
    /* Footer */
    .email-footer {
      margin: 0 auto;
      padding: 20px;
      text-align: center;
      width: 100%;
      max-width: 570px;
    }
    
    .email-footer p {
      color: #6b7280;
      font-size: 12px;
      text-align: center;
      margin: 0;
    }
    
    .email-footer a {
      color: #6b7280;
      text-decoration: underline;
    }

    /* Dark mode overrides */
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #1a202c !important;
      }
      .email-wrapper {
        background-color: #1a202c !important;
      }
      .email-body {
        background-color: #2d3748 !important;
        border-color: #4a5568 !important;
      }
      .email-body_inner {
        background-color: #2d3748 !important;
      }
      h1 {
        color: #f7fafc !important;
      }
      p, ul {
        color: #e2e8f0 !important;
      }
      .email-footer p, .email-footer a {
        color: #a0aec0 !important;
      }
    }
  </style>
</head>
<body>
  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center">
        <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <!-- Body -->
          <tr>
            <td class="email-body">
              <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td>
                    <h1>Welcome to Tiny Church!</h1>
                    <p>Thanks for signing up to receive updates about Tiny Church. We're excited to have you join our community!</p>
                    <p>We'll keep you informed about:</p>
                    <ul>
                      <li>Our upcoming launch</li>
                      <li>New features and improvements</li>
                      <li>Tips for building stronger church communities</li>
                      <li>Special announcements and events</li>
                    </ul>
                    <p>In the meantime, feel free to visit our website to learn more about what we're building.</p>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td align="center" class="button-td">
                          <a href="${process.env.NEXT_PUBLIC_WEBSITE_URL}" class="button" target="_blank">
                            Visit Our Website
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin-top: 20px;">Best regards,<br>The Tiny Church Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td>
              <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <p>
                      &copy; ${new Date().getFullYear()} Tiny Church. All rights reserved.<br>
                      <a href="${process.env.NEXT_PUBLIC_UNSUBSCRIBE_URL}?email=${email}">Unsubscribe</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`; 