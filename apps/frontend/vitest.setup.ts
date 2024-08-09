
import { config } from '@vue/test-utils'
import { beforeEach, vi } from 'vitest'
import { createRouterMock, injectRouterMock, VueRouterMock } from 'vue-router-mock'
// 初始化 vue3-emoji-picker 所需要的indeDb数据(测试用!!!)
import "fake-indexeddb/auto"

function setupRouterMock() {
	// 创建一个假的路由 上面的属性都被替换了
	const router = createRouterMock({
		spy: {
			// 创建测试间谍，因为他并不知道 使用的 那种测试框架 jest、vitest 等等
			create: func => vi.fn(func),
			reset: spy => spy.mockClear(),
		}
	})

	// 将路由挂载到 v-t-u 对象上
	config.plugins.VueWrapper.install(VueRouterMock)

  beforeEach(() => {
    // 放在这里避免其他测试文件影响导致 不成功所以每次执行case之前都初始化一下
    // 将假的路由交给 v-t-u 初始化操作
    injectRouterMock(router)
    // 将测试的 router 状态重置
    router.reset()
  })

}

setupRouterMock()
