import { compare } from 'bcrypt'
import { shared, env } from '@appblocks/node-sdk'
import jwt from 'jsonwebtoken'

/**
 * @swagger
 * /auth_be_login:
 *   post:
 *     summary: Login for a new user
 *     description: Login for a new user.
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
 *                 example: memberUser4@mailinator.com
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: Password@97
 *     responses:
 *       '201':
 *         description: Created
 *       '200':
 *         description: Ok
 */

// env.init()
const handler = async ({ req, res }) => {
  const {
    getBody,
    sendResponse,
    isEmpty,
    prisma,
    validateRequestMethod,
    checkHealth,
  } = await shared.getShared()

  try {
    // health check
    if (checkHealth(req, res)) return

    await validateRequestMethod(req, ['POST'])

    const requestBody = await getBody(req)

    if (isEmpty(requestBody)) {
      return sendResponse(res, 400, {
        message: 'Please provide email ID and password to login',
      })
    }

    const user_account = await prisma.user_account.findFirst({
      where: {
        email: requestBody.email,
      },
      include: { user: true },
    })

    if (!user_account) {
      return sendResponse(res, 400, {
        message: 'Invalid email/password',
      })
    }

    const { user } = user_account

    const isPasswordMatching = await compare(
      requestBody.password,
      user_account.password_hash
    ).catch(() => false)

    if (!isPasswordMatching) {
      console.log(isPasswordMatching)
      return sendResponse(res, 401, {
        message: 'Invalid email/password',
      })
    }

    if (isPasswordMatching && !user_account.is_email_verified) {
      return sendResponse(res, 403, {
        data: {
          user_id: user.id,
          is_email_verified: user_account.is_email_verified,
        },
        message: 'User is not Verified.',
      })
    }

    const tokenGenerate = {
      first_name: user.first_name,
      id: user.id,
      email: user_account.email,
      is_email_verified: user_account.is_email_verified,
    }

    const secretKey = process.env.BB_AUTH_SECRET_KEY
    const refreshKey = process.env.BB_AUTH_REFRESH_KEY

    const userResponse = {
      token: jwt.sign(tokenGenerate, secretKey, {
        expiresIn: process.env.BB_AUTH_ACCESS_TOKEN_EXPIRY,
      }),
      refreshToken: jwt.sign(tokenGenerate, refreshKey, {
        expiresIn: process.env.BB_AUTH_REFRESH_TOKEN_EXPIRY,
      }),
      refreshExpiry: parseInt(
        process.env.BB_AUTH_REFRESH_TOKEN_EXPIRY.slice(0, -1),
        10
      ),
    }

    sendResponse(res, 200, {
      data: userResponse,
      message: 'Sucess',
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
