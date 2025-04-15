// Unit tests for: sendFrameToEmail

const { sendFrameToEmail } = require("../userController");
const { create } = require("../../models/frameModel");
const { bucket } = require("../../config/firebaseConfig");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { uploadFileToFirebase } = require("../../utilities/firebaseutility");

jest.mock("nodemailer");
jest.mock("fs");

describe("sendFrameToEmail() sendFrameToEmail method", () => {
  let req, res, transporterMock, sendMailMock;

  beforeEach(() => {
    // Mock request and response objects
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();

    // Mock nodemailer transporter
    sendMailMock = jest.fn().mockResolvedValue({});
    transporterMock = { sendMail: sendMailMock };
    nodemailer.createTransport.mockReturnValue(transporterMock);

    // Mock fs.unlinkSync
    fs.unlinkSync.mockImplementation(() => {});
  });

  describe("Happy paths", () => {
    it("should send an email with the image attachment successfully", async () => {
      // Arrange
      req.file = {
        originalname: "test.jpg",
        path: "/tmp/test.jpg",
        mimetype: "image/jpeg",
      };
      req.body.email = "test@example.com";

      // Act
      await sendFrameToEmail(req, res);

      // Assert
      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(sendMailMock).toHaveBeenCalledWith({
        from: expect.any(String),
        to: "test@example.com",
        subject: "Your Image Attachment",
        text: "Please find your attached image.",
        attachments: [
          {
            filename: "test.jpg",
            content: expect.anything(),
            contentType: "image/jpeg",
          },
        ],
      });
      expect(fs.unlinkSync).toHaveBeenCalledWith("/tmp/test.jpg");
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        success: true,
        message: "Image sent to email successfully",
      });
    });
  });

  describe("Edge cases", () => {
    it("should return 400 if no file is provided", async () => {
      // Arrange
      req.body.email = "test@example.com";

      // Act
      await sendFrameToEmail(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        success: false,
        message: "Please provide both an image file and an email address",
      });
    });

    it("should return 400 if no email is provided", async () => {
      // Arrange
      req.file = {
        originalname: "test.jpg",
        path: "/tmp/test.jpg",
        mimetype: "image/jpeg",
      };

      // Act
      await sendFrameToEmail(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        success: false,
        message: "Please provide both an image file and an email address",
      });
    });

    it("should return 400 if email format is invalid", async () => {
      // Arrange
      req.file = {
        originalname: "test.jpg",
        path: "/tmp/test.jpg",
        mimetype: "image/jpeg",
      };
      req.body.email = "invalid-email";

      // Act
      await sendFrameToEmail(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        success: false,
        message: "Please provide a valid email address",
      });
    });

    it("should return 500 if sending email fails", async () => {
      // Arrange
      req.file = {
        originalname: "test.jpg",
        path: "/tmp/test.jpg",
        mimetype: "image/jpeg",
      };
      req.body.email = "test@example.com";
      sendMailMock.mockRejectedValue(new Error("SMTP error"));

      // Act
      await sendFrameToEmail(req, res);

      // Assert
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        success: false,
        message: "Failed to send image to email",
        error: "SMTP error",
      });
      expect(fs.unlinkSync).toHaveBeenCalledWith("/tmp/test.jpg");
    });
  });
});

// End of unit tests for: sendFrameToEmail
