import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const canSendMail = () => {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
};

const formatStatus = (status = "") => {
  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export async function sendPatientDonorMatchEmail({
  patientEmail,
  bloodGroup,
  donors,
}) {
  if (!canSendMail() || !patientEmail) {
    console.log("Email credentials or patient email missing. Skipping mail.");
    return;
  }

  const donorRows = donors
    .slice(0, 5)
    .map((donor, index) => {
      const phone =
        donor.privacySettings?.showPhoneToPatients === false
          ? "Hidden by donor privacy"
          : donor.phone;

      const verified = donor.isVerifiedDonor ? "Verified" : "Not verified";

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${donor.name}</td>
          <td>${donor.bloodGroup}</td>
          <td>${donor.city}</td>
          <td>${phone}</td>
          <td>${verified}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Blood Group Available - ${bloodGroup}</h2>

      <p>Your requested blood group is available. Matching donor details are below:</p>

      <table border="1" cellpadding="8" cellspacing="0">
        <thead>
          <tr>
            <th>#</th>
            <th>Donor Name</th>
            <th>Blood Group</th>
            <th>City</th>
            <th>Phone</th>
            <th>Verification</th>
          </tr>
        </thead>

        <tbody>
          ${donorRows}
        </tbody>
      </table>

      <p>Please contact the donor respectfully and confirm availability before visiting.</p>

      <p>
        Regards,<br />
        LifeDrop Blood Bank
      </p>
    </div>
  `;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: patientEmail,
    subject: `LifeDrop: ${bloodGroup} blood donor available`,
    html,
  });
}

export async function sendDonorNewBloodRequestEmail({
  donorEmail,
  donorName,
  request,
  patientName,
}) {
  if (!canSendMail() || !donorEmail) {
    console.log(
      "Email credentials or donor email missing. Skipping donor mail.",
    );
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>New Blood Request Matched With You</h2>

      <p>Hello ${donorName || "Donor"},</p>

      <p>A patient blood request has been matched with your donor profile.</p>

      <table border="1" cellpadding="8" cellspacing="0">
        <tr>
          <th>Patient Name</th>
          <td>${patientName || "Patient"}</td>
        </tr>

        <tr>
          <th>Blood Group</th>
          <td>${request.bloodGroup}</td>
        </tr>

        <tr>
          <th>Hospital</th>
          <td>${request.hospitalName}</td>
        </tr>

        <tr>
          <th>City</th>
          <td>${request.city}</td>
        </tr>

        <tr>
          <th>Units Required</th>
          <td>${request.units}</td>
        </tr>

        <tr>
          <th>Urgency</th>
          <td>${request.urgency || "Normal"}</td>
        </tr>

        <tr>
          <th>Patient Contact</th>
          <td>${request.contactNumber}</td>
        </tr>
      </table>

      <p>Please login to LifeDrop and accept or decline this request.</p>

      <p>
        Regards,<br />
        LifeDrop Blood Bank
      </p>
    </div>
  `;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: donorEmail,
    subject: `LifeDrop: New ${request.bloodGroup} blood request matched with you`,
    html,
  });
}

export async function sendPatientDonorAcceptedEmail({
  patientEmail,
  bloodGroup,
  donor,
  request,
}) {
  if (!canSendMail() || !patientEmail) {
    console.log(
      "Email credentials or patient email missing. Skipping donor accepted mail.",
    );
    return;
  }

  const phone =
    donor.privacySettings?.showPhoneToPatients === false
      ? "Hidden by donor privacy"
      : donor.phone;

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Donor Accepted Your Blood Request</h2>

      <p>Your ${bloodGroup} blood request has been accepted by a donor.</p>

      <h3>Donor Details</h3>

      <table border="1" cellpadding="8" cellspacing="0">
        <tr>
          <th>Name</th>
          <td>${donor.name}</td>
        </tr>

        <tr>
          <th>Blood Group</th>
          <td>${donor.bloodGroup}</td>
        </tr>

        <tr>
          <th>City</th>
          <td>${donor.city}</td>
        </tr>

        <tr>
          <th>Phone</th>
          <td>${phone}</td>
        </tr>

        <tr>
          <th>Verified</th>
          <td>${donor.isVerifiedDonor ? "Yes" : "No"}</td>
        </tr>
      </table>

      <h3>Request Details</h3>

      <p>
        Hospital: ${request.hospitalName}<br />
        City: ${request.city}<br />
        Units Required: ${request.units}<br />
        Contact Number: ${request.contactNumber}
      </p>

      <p>Please contact the donor respectfully and confirm before visiting.</p>

      <p>
        Regards,<br />
        LifeDrop Blood Bank
      </p>
    </div>
  `;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: patientEmail,
    subject: `LifeDrop: Donor accepted your ${bloodGroup} blood request`,
    html,
  });
}

export async function sendDonorResponseConfirmationEmail({
  donorEmail,
  donorName,
  request,
  status,
}) {
  if (!canSendMail() || !donorEmail) {
    console.log(
      "Email credentials or donor email missing. Skipping donor response confirmation mail.",
    );
    return;
  }

  const formattedStatus = formatStatus(status);

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Your Response Has Been Recorded</h2>

      <p>Hello ${donorName || "Donor"},</p>

      <p>Your response for this blood request is: <strong>${formattedStatus}</strong></p>

      <table border="1" cellpadding="8" cellspacing="0">
        <tr>
          <th>Blood Group</th>
          <td>${request.bloodGroup}</td>
        </tr>

        <tr>
          <th>Hospital</th>
          <td>${request.hospitalName}</td>
        </tr>

        <tr>
          <th>City</th>
          <td>${request.city}</td>
        </tr>

        <tr>
          <th>Units Required</th>
          <td>${request.units}</td>
        </tr>

        <tr>
          <th>Status</th>
          <td>${formattedStatus}</td>
        </tr>
      </table>

      <p>
        Regards,<br />
        LifeDrop Blood Bank
      </p>
    </div>
  `;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: donorEmail,
    subject: `LifeDrop: Your response is ${formattedStatus}`,
    html,
  });
}

export async function sendRequestStatusUpdateEmail({
  recipients,
  request,
  status,
  note = "",
}) {
  if (!canSendMail()) {
    console.log("Email credentials missing. Skipping status update mail.");
    return;
  }

  const emailList = Array.isArray(recipients)
    ? recipients.filter(Boolean)
    : [recipients].filter(Boolean);

  const uniqueEmails = [...new Set(emailList)];

  if (uniqueEmails.length === 0) {
    console.log("No recipients found for status update mail.");
    return;
  }

  const formattedStatus = formatStatus(status);

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Blood Request Status Updated</h2>

      <p>Your LifeDrop blood request status has been updated.</p>

      <table border="1" cellpadding="8" cellspacing="0">
        <tr>
          <th>Blood Group</th>
          <td>${request.bloodGroup}</td>
        </tr>

        <tr>
          <th>Hospital</th>
          <td>${request.hospitalName}</td>
        </tr>

        <tr>
          <th>City</th>
          <td>${request.city}</td>
        </tr>

        <tr>
          <th>Units Required</th>
          <td>${request.units}</td>
        </tr>

        <tr>
          <th>Status</th>
          <td>${formattedStatus}</td>
        </tr>
      </table>

      ${note ? `<p><strong>Note:</strong> ${note}</p>` : ""}

      <p>
        Regards,<br />
        LifeDrop Blood Bank
      </p>
    </div>
  `;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: uniqueEmails.join(","),
    subject: `LifeDrop: Blood request status updated to ${formattedStatus}`,
    html,
  });
}
export async function sendVerificationStatusEmail({
  recipientEmail,
  recipientName,
  verificationType,
  isVerified,
  note = "",
}) {
  if (!canSendMail() || !recipientEmail) {
    console.log(
      "Email credentials or recipient email missing. Skipping verification mail.",
    );
    return;
  }

  const statusText = isVerified ? "Verified" : "Verification Removed";

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>LifeDrop ${verificationType} ${statusText}</h2>

      <p>Hello ${recipientName || "User"},</p>

      <p>Your ${verificationType} status has been updated by LifeDrop admin.</p>

      <table border="1" cellpadding="8" cellspacing="0">
        <tr>
          <th>Verification Type</th>
          <td>${verificationType}</td>
        </tr>

        <tr>
          <th>Status</th>
          <td>${statusText}</td>
        </tr>
      </table>

      ${note ? `<p><strong>Note:</strong> ${note}</p>` : ""}

      <p>
        Regards,<br />
        LifeDrop Blood Bank
      </p>
    </div>
  `;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `LifeDrop: ${verificationType} ${statusText}`,
    html,
  });
}
export async function sendPasswordResetEmail({
  userEmail,
  userName,
  resetUrl,
}) {
  if (!canSendMail() || !userEmail) {
    console.log("Email credentials or user email missing. Skipping password reset mail.");
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>LifeDrop Password Reset</h2>

      <p>Hello ${userName || "User"},</p>

      <p>You requested to reset your LifeDrop account password.</p>

      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#e11d48;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;">
          Reset Password
        </a>
      </p>

      <p>This link will expire in 15 minutes.</p>

      <p>If you did not request this, please ignore this email.</p>

      <p>
        Regards,<br />
        LifeDrop Blood Bank
      </p>
    </div>
  `;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: userEmail,
    subject: "LifeDrop: Reset your password",
    html,
  });
}