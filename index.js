import { shared, env } from '@appblocks/node-sdk'
import hbs from 'hbs'
import otpTemp from './templates/otp-temp.js'

env.init()

/**
 * @swagger
 * /auth_be_resend_email_otp:
 *   post:
 *     summary: Resend otp for a given email
 *     description: Resend otp for a given email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email
 *                 example: appblocksadmin@mailinator.com
 *     responses:
 *       '201':
 *         description: Created
 *       '200':
 *         description: Ok
 */

const handler = async ({ req, res }) => {
  const {
    getBody,
    sendResponse,
    isEmpty,
    prisma,
    validateRequestMethod,
    generateRandomString,
    sendMail,
    redis,
    checkHealth,
  } = await shared.getShared()
  try {
    // health check
    if (checkHealth(req, res)) return

    await validateRequestMethod(req, ['POST'])

    const requestBody = await getBody(req)

    if (isEmpty(requestBody)) {
      sendResponse(res, 400, {
        message: 'Please provide valid email',
      })
      return
    }

    const user_account = await prisma.user_account.findFirst({
      where: {
        email: requestBody.email,
      },
      include: { user: true },
    })

    if (!user_account) {
      return sendResponse(res, 400, {
        message: 'Please enter a valid user id',
      })
    }

    const { user } = user_account
    const otp = generateRandomString()
    if (!redis.isOpen) await redis.connect()
    await redis.set(`${user_account.id}_otp`, otp, {
      EX: Number(process.env.BB_AUTH_OTP_EXPIRY_TIME_IN_SECONDS),
    })
    await redis.disconnect()

    const emailTemplate = hbs.compile(otpTemp)

    const message = {
      to: requestBody.email,
      from: {
        name: process.env.EMAIL_SENDER_NAME,
        email: process.env.SENDER_EMAIL_ID,
      },
      subject: 'verify otp',
      text: 'Please verify your otp',
      html: emailTemplate({
        logo: process.env.LOGO_URL,
        user: user.first_name,
        otp,
      }),
    }
    await sendMail(message)

    sendResponse(res, 200, {
      message: 'OTP resend successfully',
    })
  } catch (e) {
    console.log(e.message)
    if (e.errorCode && e.errorCode < 500) {
      sendResponse(res, e.errorCode, {
        message: e.message,
      })
    } else {
      sendResponse(res, 500, {
        message: 'failed',
      })
    }
  }
}

export default handler
