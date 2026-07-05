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

export async function sendPatientDonorMatchEmail({
  patientEmail,
  bloodGroup,
  donors,
}) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("Email credentials missing. Skipping mail.");
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

export async function sendPatientDonorAcceptedEmail({
  patientEmail,
  bloodGroup,
  donor,
  request,
}) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("Email credentials missing. Skipping donor accepted mail.");
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