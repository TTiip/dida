import { beforeEach, describe, expect, it, vi } from "vitest"
import { createRouterMock, RouterMock } from "vue-router-mock"
import { routes, setupRouterGuard } from ".."
import { RouteNames } from "../const"
import { cleanToken, setToken } from "@/utils/token"

function setUpRouter() {
	const router = createRouterMock({
		spy: {
			create: fn => vi.fn(fn),
			reset: spy => spy.mockClear()
		},
		routes,
		useRealNavigation: true
	})


	setupRouterGuard(router)
	return router
}

describe('router', () => {
	// 1.当发现需要跳转的页面需要权限验证的时候
	// 	1)用户拥有权限 -> 跳转过去
	// 	2)用户没有权限 -> 跳转登录页面
	// 2.当发现需要跳转的页面不需要权限验证的时候
	// 	1)直接跳转过去

	describe('require auth', () => {
		let router: RouterMock
		beforeEach(() => {
			cleanToken()
			router = setUpRouter()
		})

		it('should go to task page when have token', async () => {
			setToken('token ')

			await router.push({ name: RouteNames.TASK })
			expect(router.currentRoute.value.name).toBe(RouteNames.TASK)
		})


		it('should go to login page when have not token', async () => {
			// 模拟跳过等待
			vi.useFakeTimers()
			// 这里是一个 promise 不用等待，在后面调用 runAllTimersAsync 等待执行完成
			router.push({ name: RouteNames.TASK })
			await vi.runAllTimersAsync()

			expect(router.currentRoute.value.name).toBe(RouteNames.LOGIN)
			// expect()
		})

		it('should go to home page when have not need auth', async () => {

			await router.push({ name: RouteNames.LOGIN })

			expect(router.currentRoute.value.name).toBe(RouteNames.LOGIN)
		})
	})
})

