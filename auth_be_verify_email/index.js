/* eslint-disable import/extensions */
import { shared, env } from '@appblocks/node-sdk'
import hbs from 'hbs'
import otpTemp from './templates/otp-email-temp.js'

env.init()
const handler = async (event) => {
  const { req, res } = event

  const {
    sendResponse,
    getBody,
    prisma,
    validateRequestMethod,
    checkHealth,
    isEmpty,
    redis,
    sendMail,
    generateRandomString,
  } = await shared.getShared()
  try {
    // health check
    if (checkHealth(req, res)) return

    await validateRequestMethod(req, ['POST'])

    const requestBody = await getBody(req)

    if (isEmpty(requestBody) || !requestBody.hasOwnProperty('user_id')) {
      return sendResponse(res, 400, {
        message: 'Please provide a User ID',
      })
    }

    const user_account = await prisma.user_account.findFirst({
      where: {
        id: requestBody.user_account_id,
      },
      include: { user: true },
    })

    if (!user_account) {
      return sendResponse(res, 400, { message: 'Invalid User ID' })
    }

    const otp = generateRandomString()

    // Store the otp with an expiry stored in env.function in seconds
    if (!redis.isOpen) await redis.connect()
    await redis.set(`${user_account.id}_otp`, otp, {
      EX: Number(process.env.BB_AUTH_OTP_EXPIRY_TIME_IN_SECONDS),
    })
    await redis.disconnect()

    const emailTemplate = hbs.compile(otpTemp)

    const { user } = user_account

    const message = {
      to: user_account.email,
      from: {
        name: process.env.EMAIL_SENDER_NAME,
        email: process.env.SENDER_EMAIL_ID,
      },
      subject: 'verify otp',
      text: 'Please verify your otp',
      html: emailTemplate({
        logo: process.env.BB_AUTH_LOGO_URL,
        user: user.first_name,
        otp,
      }),
    }
    await sendMail(message)

    return sendResponse(res, 200, {
      message:
        'We have sent you an email containing One time password to registered email',
    })
  } catch (e) {
    console.log(e.message)
    if (e.errorCode && e.errorCode < 500) {
      return sendResponse(res, e.errorCode, {
        message: e.message,
      })
    } else {
      return sendResponse(res, 500, {
        message: 'failed',
      })
    }
  }
}

export default handler
