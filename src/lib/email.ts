import nodemailer from 'nodemailer';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test email configuration
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('Email server connection successful!');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
}

// Function to send signup congratulatory email
export async function sendSignupCongrats(email: string, name: string, role: string) {
  try {
    console.log('Attempting to send signup email to:', email);

    const subject = 'Welcome to AgriGuard - Account Created Successfully!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5a27;">Congratulations ${name}!</h2>
        <p>Your AgriGuard account has been created successfully.</p>
        <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
        <p>You can now access all the features of our agricultural platform.</p>
        <p>Best regards,<br>AgriGuard Team</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    };

    console.log('Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const result = await transporter.sendMail(mailOptions);
    console.log('Signup congratulatory email sent successfully to:', email, 'Message ID:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending signup email:', error);
    throw error;
  }
}

// Function to generate booking PDF
function generateBookingPDF(bookingData: any) {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('AgriGuard - Booking Confirmation', 20, 30);

  doc.setFontSize(12);
  doc.text(`Booking ID: ${bookingData._id}`, 20, 50);
  doc.text(`Service: ${bookingData.service?.name || 'N/A'}`, 20, 60);
  doc.text(`Farmer: ${bookingData.farmer?.name || 'N/A'}`, 20, 70);
  doc.text(`Provider: ${bookingData.provider?.name || 'N/A'}`, 20, 80);
  doc.text(`Booking Date: ${new Date(bookingData.bookingDate).toLocaleDateString()}`, 20, 90);
  doc.text(`Status: ${bookingData.status || 'pending'}`, 20, 100);
  if (bookingData.notes) {
    doc.text(`Notes: ${bookingData.notes}`, 20, 110);
  }

  return doc.output('arraybuffer');
}

// Function to send booking confirmation email with PDF
export async function sendBookingConfirmation(email: string, bookingData: any) {
  try {
    const pdfBuffer = generateBookingPDF(bookingData);

    const subject = 'AgriGuard - Booking Confirmation';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5a27;">Booking Confirmed!</h2>
        <p>Your booking has been successfully created.</p>
        <p><strong>Booking ID:</strong> ${bookingData._id}</p>
        <p><strong>Service:</strong> ${bookingData.service?.name || 'N/A'}</p>
        <p><strong>Booking Date:</strong> ${new Date(bookingData.bookingDate).toLocaleDateString()}</p>
        <p>Please find the booking details attached as a PDF.</p>
        <p>Best regards,<br>AgriGuard Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      html,
      attachments: [
        {
          filename: `booking-${bookingData._id}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: 'application/pdf',
        },
      ],
    });

    console.log('Booking confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending booking email:', error);
  }
}

export async function sendProviderBookingAlert(email: string, bookingData: any) {
  try {
    const subject = 'AgriGuard - New Booking Alert';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5a27;">New Booking Received!</h2>
        <p>You have a new booking request.</p>
        <p><strong>Service:</strong> ${bookingData.service?.name || 'N/A'}</p>
        <p><strong>Farmer:</strong> ${bookingData.farmer?.name || 'N/A'}</p>
        <p><strong>Date:</strong> ${new Date(bookingData.workStartDate || bookingData.bookingDate).toLocaleDateString()}</p>
        <p>Please review and accept or reject this booking in your dashboard.</p>
        <p>Best regards,<br>AgriGuard Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    });

    console.log('Provider booking alert sent to:', email);
  } catch (error) {
    console.error('Error sending provider booking alert:', error);
  }
}

// Function to send service added confirmation email
export async function sendServiceAdded(email: string, serviceData: any) {
  try {
    const subject = 'AgriGuard - Service Added Successfully';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5a27;">Service Added Successfully!</h2>
        <p>Your service has been added to AgriGuard platform.</p>
        <p><strong>Service Name:</strong> ${serviceData.name}</p>
        <p><strong>Description:</strong> ${serviceData.description}</p>
        <p><strong>Price:</strong> ₹${serviceData.price}</p>
        <p>Farmers can now book your service through the platform.</p>
        <p>Best regards,<br>AgriGuard Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    });

    console.log('Service added email sent to:', email);
  } catch (error) {
    console.error('Error sending service email:', error);
  }
}

// Function to send package added confirmation email
export async function sendPackageAdded(email: string, packageData: any) {
  try {
    const subject = 'AgriGuard - Package Added Successfully';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5a27;">Package Added Successfully!</h2>
        <p>Your package has been added to AgriGuard platform.</p>
        <p><strong>Package Name:</strong> ${packageData.name}</p>
        <p><strong>Crop:</strong> ${packageData.crop}</p>
        <p><strong>Duration:</strong> ${packageData.duration} days</p>
        <p><strong>Price:</strong> ₹${packageData.price}</p>
        <p>Farmers can now purchase your package through the platform.</p>
        <p>Best regards,<br>AgriGuard Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    });

    console.log('Package added email sent to:', email);
  } catch (error) {
    console.error('Error sending package email:', error);
  }
}

// Function to send land added confirmation email
export async function sendLandAdded(email: string, landData: any) {
  try {
    const subject = 'AgriGuard - Land Listed Successfully';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5a27;">Land Listed Successfully!</h2>
        <p>Your land has been listed on AgriGuard platform for leasing.</p>
        <p><strong>Title:</strong> ${landData.title}</p>
        <p><strong>Location:</strong> ${landData.location?.village}, ${landData.location?.district}, ${landData.location?.state}</p>
        <p><strong>Size:</strong> ${landData.size?.value} ${landData.size?.unit}</p>
        <p><strong>Lease Price:</strong> ₹${landData.leasePrice} per ${landData.leaseDuration}</p>
        <p>Providers can now view and request to lease your land through the platform.</p>
        <p>Best regards,<br>AgriGuard Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    });

    console.log('Land added email sent to:', email);
  } catch (error) {
    console.error('Error sending land email:', error);
  }
}

// Function to send lease request notification to land owner
export async function sendLeaseRequestNotification(email: string, landData: any, requesterData: any) {
  try {
    const subject = 'AgriGuard - New Lease Request for Your Land';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5a27;">New Lease Request!</h2>
        <p>You have received a new lease request for your land on AgriGuard platform.</p>
        <p><strong>Land Title:</strong> ${landData.title}</p>
        <p><strong>Location:</strong> ${landData.location?.village}, ${landData.location?.district}, ${landData.location?.state}</p>
        <p><strong>Requester:</strong> ${requesterData.name} (${requesterData.email})</p>
        <p>Please log in to your dashboard to review and accept or reject this request.</p>
        <p>Best regards,<br>AgriGuard Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    });

    console.log('Lease request notification email sent to:', email);
  } catch (error) {
    console.error('Error sending lease request notification email:', error);
  }
}

// Function to send lease request response to requester
export async function sendLeaseRequestResponse(email: string, landData: any, status: string, ownerData: any) {
  try {
    const subject = `AgriGuard - Lease Request ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${status === 'accepted' ? '#2d5a27' : '#d32f2f'};">Lease Request ${status.charAt(0).toUpperCase() + status.slice(1)}!</h2>
        <p>Your lease request for the following land has been ${status}.</p>
        <p><strong>Land Title:</strong> ${landData.title}</p>
        <p><strong>Location:</strong> ${landData.location?.village}, ${landData.location?.district}, ${landData.location?.state}</p>
        <p><strong>Land Owner:</strong> ${ownerData.name} (${ownerData.email})</p>
        ${status === 'accepted' ? '<p>Please contact the land owner to finalize the lease agreement.</p>' : '<p>You can try requesting other available lands.</p>'}
        <p>Best regards,<br>AgriGuard Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    });

    console.log('Lease request response email sent to:', email);
  } catch (error) {
    console.error('Error sending lease request response email:', error);
  }
}
