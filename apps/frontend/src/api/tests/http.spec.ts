import { beforeEach, describe, expect, it, vi } from "vitest"
import AxiosMockAdapter from 'axios-mock-adapter'
import { http } from '@/api/http'
import { cleanToken, setToken } from "@/utils/token"
import { goToLogin } from "@/composables"

// 写法一
// import { messageError } from '@/composables/message'
// vi.mock('@/composables/message')

// 写法二
import * as messageObject from '@/composables/message'
// vi.spyOn(messageObject, 'messageError')
// vi.spyOn(messageObject, 'messageRedirectToSignIn')
const fnArr = ['messageError', 'messageRedirectToSignIn'] as const
const mapFnArr = fnArr.map(key => vi.spyOn(messageObject, key))


describe('http', () => {
	let axiosMock: AxiosMockAdapter
	beforeEach(() => {
		cleanToken()
		axiosMock = new AxiosMockAdapter(http, {})
		// 每次调用前 清空之前的mock
		// 写法一
		// vi.clearAllMocks()
		// 写法二
		mapFnArr.map(item => item.mockClear())
	})

	it('should set header Authoriztion when have token', async () => {
		const tokenVal = 'hasaigei'
		setToken(tokenVal)
		const url = '/task'
		// 此处先定义好请求的方式、接口、返回的状态码、数据等
		axiosMock.onGet(url).reply(200, {
			code: 0,
			data: null,
			message: ''
		})

		// 此处调用
		const res = await http.get(url)
		const hearder = axiosMock?.history?.get[0]?.headers?.Authorization
		expect(hearder).toBe(`Bearer ${tokenVal}`)
	})

	it('should return data of responseData when code is 0', async () => {
		const data = 'heihei'
		const url = '/hello'
		// 此处先定义好请求的方式、接口、返回的状态码、数据等
		axiosMock.onGet(url).reply(200, {
			code: 0,
			data,
			message: ''
		})

		// 此处调用
		const res = await http.get(url)
		expect(res).toBe(data)
	})

	it('should throw error when code is not 0', async () => {
		const message = '出错啦'
		const url = '/helloketty'
		// 此处先定义好请求的方式、接口、返回的状态码、数据等
		axiosMock.onGet(url).reply(200, {
			code: -1,
			data: null,
			message
		})

		// 此处调用
		// 这里写法 验证抛出错误信息 特别注意！！
		await expect(() => http.get(url)).rejects.toThrowError(message)
		// expect(messageError).toBeCalledWith(message)
		expect(messageObject.messageError).toBeCalledWith(message)
	})

	it('should jump login page when http status is 401', async () => {
		const url = '/helloketty11'
		// 此处先定义好请求的方式、接口、返回的状态码、数据等
		axiosMock.onGet(url).reply(401)

		// 此处调用
		// 因为返回的是 promise.reject 所以
		await expect(() => http.get(url)).rejects.toThrowError()
		expect(messageObject.messageRedirectToSignIn).toBeCalledWith(goToLogin)
	})
})
