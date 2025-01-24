using Microsoft.AspNetCore.Identity.UI.Services;
using System.Net;
using System.Net.Mail;

namespace APIDeomWithImageCRUD.Services
{
    public class EmailService : IEmailSender
    {
        private readonly IConfiguration configuration;

        public EmailService(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        public async Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            var smtpClient = new SmtpClient(configuration["EmailSettings:SmtpServer"])
            {
                Port = int.Parse(configuration["EmailSettings:SmtpPort"]),
                Credentials=new NetworkCredential(configuration["EmailSettings:SmtpUser"], configuration["EmailSettings:SmtpPassword"]),
                EnableSsl = true
            };
            var mailMessage=new MailMessage()
            {
                From=new MailAddress(configuration["EmailSettings:FromEmail"]),
                Subject=subject,
                Body=htmlMessage,
                IsBodyHtml=true,
            };  
            mailMessage.To.Add(email);
            mailMessage.Subject = subject;
            mailMessage.Body=htmlMessage;

            await smtpClient.SendMailAsync(mailMessage);    
        }
    }
}
