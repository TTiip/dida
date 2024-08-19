import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { useSearch } from "../search"

const searchTasks = vi.fn()
const resetSearchTasks = vi.fn()
vi.mock('../searchTasks', () => {
	return {
		useSearchTasks () {
			return {
				searchTasks,
				resetSearchTasks,
			}
		}
	}
})

const searchCommands = vi.fn()
const resetSearchCommands = vi.fn()
vi.mock('../searchCommands.ts', () => {
	return {
		useSearchCommands () {
			return {
				searchCommands,
				resetSearchCommands,
			}
		}
	}
})

describe('测试search组件', () => {
	beforeEach(async () => {
		vi.useFakeTimers()
		// 每次执行前都重置(测试间谍、全局变量等)
		const { resetSearch } = useSearch()
		resetSearch()

		// 等待 resetSearch 所有的异步执行完成，避免后面调用问题
		await vi.runAllTimersAsync()

		// 使用这个全部重置
		vi.clearAllMocks()
		// 依次清除使用的 mock
		// searchTasks.mockClear()
		// resetSearchTasks.mockClear()
		// searchCommands.mockClear()
		// resetSearchCommands.mockClear()
	})

	afterEach(() => {
		// 还没搞清楚啥情况 有时候用了 会导致奇怪的问题，使用待定
		// 每个测试case结束以后 重置mock时间
		vi.useRealTimers()
	})

	test('当开始搜索的时候 loading 为true', async () => {
		const { loading, search } = useSearch()
		search.value = '吃饭'
		// 等待内部的 promise 执行完成(只处理一层)
		await vi.advanceTimersToNextTimerAsync()
		expect(loading.value).toBe(true)
	})

	test('当搜索完成的时候 loading 为false', async () => {
		const { loading, search } = useSearch()
		search.value = '吃饭'
		// 等待内部全部的 异步操作 执行完成 方法一
		// await vi.advanceTimersToNextTimerAsync()
		// await vi.advanceTimersToNextTimerAsync()

		// 等待所有的 异步操作 执行完成以后在走下方的逻辑(全部处理) 方法二
		await vi.runAllTimersAsync()
		expect(loading.value).toBe(false)
	})

	test('当搜索完成的时候 searching 为true', async () => {
		const { searching, search } = useSearch()
		search.value = '吃饭'

		await vi.runAllTimersAsync()
		expect(searching.value).toBe(true)
	})

	test('搜索任务', async () => {
		const { search } = useSearch()
		search.value = '吃饭'

		await vi.runAllTimersAsync()

		expect(searchTasks).toBeCalledTimes(1)
		expect(searchTasks).toHaveBeenLastCalledWith('吃饭')
	})

	test('搜索命令', async () => {
		const { search } = useSearch()
		search.value = '>主页'

		await vi.runAllTimersAsync()

		expect(searchCommands).toBeCalledTimes(1)
		expect(searchCommands).toHaveBeenLastCalledWith('主页')
	})

	test('搜索命令 尾部带空格', async () => {
		const { search } = useSearch()
		search.value = '>主页 '

		await vi.runAllTimersAsync()

		expect(searchCommands).toBeCalledTimes(1)
		expect(searchCommands).toHaveBeenLastCalledWith('主页')
	})

	test('搜索为空时 reset 操作', async () => {
		const { search, searching, loading } = useSearch()
		search.value = '吃饭'
		await vi.runAllTimersAsync()

		search.value = ''
		await vi.runAllTimersAsync()

		expect(resetSearchTasks).toBeCalledTimes(1)
		expect(resetSearchCommands).toBeCalledTimes(1)
		expect(searching.value).toBe(false)
		expect(loading.value).toBe(false)
	})
})
