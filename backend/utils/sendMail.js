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
    .map(
      (donor, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${donor.name}</td>
          <td>${donor.bloodGroup}</td>
          <td>${donor.city}</td>
          <td>${donor.phone}</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Blood Group Available - ${bloodGroup}</h2>

      <p>Your requested blood group is available. Here are available donor details:</p>

      <table border="1" cellpadding="8" cellspacing="0">
        <thead>
          <tr>
            <th>#</th>
            <th>Donor Name</th>
            <th>Blood Group</th>
            <th>City</th>
            <th>Phone</th>
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