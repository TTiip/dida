import { describe, test, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { useSearch } from '../search'
import { createTestingPinia } from '@pinia/testing'
import { completeSmartProject, useListProjectsStore, useTasksStore } from '@/store'
import { tasks, liveListProject } from '@/tests/fixture'
import { useSearchTasks } from '../searchTasks'
import { useSearchCommands } from '../searchCommands'
import { useCommand } from '@/composables/command'

describe('群居测试模块', () => {
	describe('搜索任务', () => {
		beforeEach(() => {
			// 重置 search 的值(重要!!!)
			const { search } = useSearch()
			search.value = ''

			vi.useFakeTimers()

			createTestingPinia({
				createSpy: vi.fn
			})
			const { findAllTasksNotRemoved } = useTasksStore()
			vi.mocked(findAllTasksNotRemoved).mockImplementation(async () => {
				return tasks
			})
			// 写法二 如果返回的是一个 promise 可以用
			// vi.mocked(findAllTasksNotRemoved).mockResolvedValue(tasks)

			const { findProject } = useListProjectsStore()
			vi.mocked(findProject).mockImplementation(() => {
				return liveListProject
			})
		})

		// 此处添加会导致 测试测试case不通过(原因不详 目前重置search值可以解决)
		// 如果是没必要使用真实的时间 就不用加 感觉这个用了会有问题
		afterEach(() => {
			vi.useRealTimers()
		})

		test('搜索任务时 loading 应为 true', async () => {
			const { search, loading } = useSearch()
			search.value = '吃饭'

			await vi.advanceTimersToNextTimerAsync()
			expect(loading.value).toBe(true)
		})

		test('搜索任务完成时 loading 应为 false', async () => {
			const { search, loading } = useSearch()
			search.value = '吃饭'

			await vi.runAllTimersAsync()
			expect(loading.value).toBe(false)
		})

		test('当搜索完成的时候 searching 为true', async () => {
			const { searching, search } = useSearch()
			search.value = '吃饭'

			await vi.runAllTimersAsync()
			expect(searching.value).toBe(true)
		})

		test('当搜索任务为搜索 title 的时候', async () => {
			const { search } = useSearch()
			const { filteredTasks } = useSearchTasks()
			search.value = '吃饭'

			await vi.runAllTimersAsync()
			const { item: resData } = filteredTasks.value[0]

      expect(resData.title).toBe('吃饭')
      expect(resData).toHaveProperty('id')
      expect(resData).toHaveProperty('desc')
      expect(resData).toHaveProperty('done')
      expect(resData).toHaveProperty('from')
		})

		test('当搜索任务为搜索 title 的时候(结尾带空格)', async () => {
			const { search } = useSearch()
			const { filteredTasks } = useSearchTasks()
			search.value = '吃饭 '

			await vi.runAllTimersAsync()
			const { item: resData } = filteredTasks.value[0]

      expect(resData.title).toBe('吃饭')
      expect(resData).toHaveProperty('id')
      expect(resData).toHaveProperty('desc')
      expect(resData).toHaveProperty('done')
      expect(resData).toHaveProperty('from')
		})

		test('当搜索任务为搜索 desc 的时候', async () => {
			const { search } = useSearch()
			const { filteredTasks } = useSearchTasks()
			search.value = '吃什么'

			await vi.runAllTimersAsync()
			const { item: resData } = filteredTasks.value[0]

      expect(filteredTasks.value.length).toBe(1)
      expect(resData.title).toBe('吃饭')
		})

		test('当搜索任务为搜索 desc 的时候(结尾带空格)', async () => {
			const { search } = useSearch()
			const { filteredTasks } = useSearchTasks()
			search.value = '吃什么 '

			await vi.runAllTimersAsync()
			const { item: resData } = filteredTasks.value[0]

      expect(filteredTasks.value.length).toBe(1)
      expect(resData.title).toBe('吃饭')
		})

		test('当搜索任务为搜索的关键词没找到结果的时候', async () => {
			const { search } = useSearch()
			const { filteredTasks } = useSearchTasks()
			search.value = '这是没找到的'

			await vi.runAllTimersAsync()
      expect(filteredTasks.value.length).toBe(0)
		})

		test('当任务状态是 active 的时候 任务列表应该是 lisProject', async () => {
			const { search } = useSearch()
			const { filteredTasks } = useSearchTasks()
			search.value = '吃饭'

			await vi.runAllTimersAsync()
			const { item: resData } = filteredTasks.value[0]

			expect(resData.done).toBe(false)
			expect(resData.from?.name).toBe('生活')
		})

		test('当任务状态是 completet 的时候 任务列表应该是 smartProject', async () => {
			const { search } = useSearch()
			const { filteredTasks } = useSearchTasks()
			search.value = '写代码'

			await vi.runAllTimersAsync()
			const { item: resData } = filteredTasks.value[0]

      expect(resData.done).toBe(true)
      expect(resData.from?.name).toBe(completeSmartProject.name)
		})

		test('重置搜索任务', async () => {
			const { search, searching, loading } = useSearch()
			const { filteredTasks } = useSearchTasks()
			search.value = '随便写点什么东西'
			await vi.runAllTimersAsync()

			search.value = ''
			await vi.runAllTimersAsync()

			expect(searching.value).toBe(false)
			expect(loading.value).toBe(false)
			expect(filteredTasks.value.length).toBe(0)
		})
	})

	describe('搜索命令', () => {
		// 初始化命令 准备已经存在的命令数组
		beforeAll(() => {
			const { addCommand } = useCommand()
			addCommand({
				name: '回到主页',
				execute () {}
			})
			addCommand({
				name: '切换皮肤',
				execute () {}
			})
		})

		beforeEach(() => {
			// 重置 search 的值(重要!!!)
			const { search } = useSearch()
			search.value = '>'

			vi.useFakeTimers()
		})

		afterEach(() => {
			vi.useRealTimers()
		})

		test('测试一个不存在的命令', async () => {
			const { search } = useSearch()
			const { filteredCommands } = useSearchCommands()
			search.value ='>这是一个不存在的命令'

			await vi.runAllTimersAsync()

			expect(filteredCommands.value.length).toBe(0)
		})

		test('测试一个已存在的命令', async () => {
			const { search } = useSearch()
			const { filteredCommands } = useSearchCommands()
			search.value ='>主页'

			await vi.runAllTimersAsync()
			const { name } = filteredCommands.value[0]
			expect(filteredCommands.value.length).toBe(1)
      expect(name).toBe('回到主页')
		})

		test('测试输入的命令 结尾带空隔', async () => {
			const { search } = useSearch()
			const { filteredCommands } = useSearchCommands()
			search.value ='>主页 '

			await vi.runAllTimersAsync()
			const { name } = filteredCommands.value[0]
			expect(filteredCommands.value.length).toBe(1)
      expect(name).toBe('回到主页')
		})

		test('重置搜索命令', async () => {
			const { search, searching, loading } = useSearch()
			const { filteredCommands } = useSearchCommands()

			search.value = '吃饭'
			await vi.runAllTimersAsync()

			search.value = '>主页'
			await vi.runAllTimersAsync()

			search.value = ''
			await vi.runAllTimersAsync()

			expect(searching.value).toBe(false)
			expect(loading.value).toBe(false)
			expect(filteredCommands.value.length).toBe(2)
		})
	})
})
