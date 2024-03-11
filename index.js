import { hash, genSalt } from 'bcrypt'
import { shared, env } from '@appblocks/node-sdk'
import hbs from 'hbs'
import otpTemp from './templates/otp-temp.js'
import validateSignupInput from './validation.js'

env.init()

const handler = async ({ req, res }) => {
  const {
    getBody,
    sendResponse,
    isEmpty,
    prisma,
    validateRequestMethod,
    checkHealth,
    generateRandomString,
    sendMail,
    redis,
  } = await shared.getShared()

  try {
    // health check
    if (checkHealth(req, res)) return

    await validateRequestMethod(req, ['POST'])

    const requestBody = await getBody(req)

    if (isEmpty(requestBody)) {
      sendResponse(res, 400, {
        message: 'Please provide the details',
      })
      return
    }

    validateSignupInput(requestBody)

    const emailValid = await prisma.user_account.findFirst({
      where: { email: requestBody.email },
    })

    if (emailValid) {
      sendResponse(res, 400, {
        message: 'This email is already in use',
      })
      return
    }

    const password_salt = await genSalt(10)
    const password_hash = await hash(requestBody.password, password_salt)

    const user = {
      first_name: requestBody.first_name,
      last_name: requestBody.last_name,
      display_name: `${requestBody.first_name} ${requestBody.last_name}`,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const user_account = {
      email: requestBody.email,
      password_salt,
      password_hash,
      is_email_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
      provider: 'password',
    }

    let user_account_id = null
    await prisma.$transaction(async (tx) => {
      const userData = await tx.user.create({
        data: user,
      })
      const userAccData = await tx.user_account.create({
        data: { ...user_account, user_id: userData.id },
      })
      user_account_id = userAccData.id
    })

    const otp = generateRandomString()
    if (!redis.isOpen) await redis.connect()
    await redis.set(`${user_account_id}_otp`, otp, {
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
      subject: 'Your Email OTP to Login to your Appblocks account',
      text: 'Please verify your otp',
      html: emailTemplate({
        logo: process.env.LOGO_URL,
        user: user.first_name,
        otp,
      }),
    }
    await sendMail(message)

    sendResponse(res, 200, {
      message: 'OTP send to registered email',
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
