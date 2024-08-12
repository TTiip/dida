import { beforeEach, describe, expect, test, vi } from "vitest"
import { createTestingPinia } from '@pinia/testing'
import { useSearchTasks } from "../searchTasks"
import { useTasksStore, useListProjectsStore, completeSmartProject } from "@/store"
import { tasks, liveListProject } from '@/tests/fixture'

describe('搜索任务', () => {
	// 每次执行case之前 重置数据
	beforeEach(() => {
		const { resetSearchTasks } = useSearchTasks()
		resetSearchTasks()
		// 测试间谍 接管 pinia
		createTestingPinia({
			createSpy: vi.fn
		})

		// 对pinia中的数据进行 mock (间接输入)
		const { findAllTasksNotRemoved } = useTasksStore()
		vi.mocked(findAllTasksNotRemoved).mockImplementation(async () => {
			return tasks
		})

		// 对pinia中的数据进行 mock (间接输入)
		const { findProject } = useListProjectsStore()
		vi.mocked(findProject).mockImplementation(() => {
			return liveListProject
		})
	})

	test('通过title搜索任务', async () => {
		const { searchTasks, filteredTasks } = useSearchTasks()
		await searchTasks('吃饭')
		const { item } = filteredTasks.value[0]

		expect(filteredTasks.value.length).toBe(1)
		expect(item.title).toBe('吃饭')
		// 去match对应的值，关心什么match什么
		expect(item).toHaveProperty('id')
		expect(item).toHaveProperty('desc')
		expect(item).toHaveProperty('done')
		expect(item).toHaveProperty('from')
	})

	test('通过desc搜索任务', async () => {
		const { searchTasks, filteredTasks } = useSearchTasks()
		await searchTasks('吃什么')
		const { item } = filteredTasks.value[0]

		expect(filteredTasks.value.length).toBe(1)
		expect(item.title).toBe('吃饭')
	})

	test('传入一个 不存在的 title 或者 desc 没有匹配到', async () => {
		const { searchTasks, filteredTasks } = useSearchTasks()
		await searchTasks('hello')
		expect(filteredTasks.value.length).toBe(0)
	})

	test('当任务状态是 active 的时候 任务列表应该是 lisProject', async () => {
		const { searchTasks, filteredTasks } = useSearchTasks()
		await searchTasks('吃饭')

		expect(filteredTasks.value[0].item.done).toBe(false)
		expect(filteredTasks.value[0].item.from?.name).toBe('生活')
	})

	test('当任务状态是 completet 的时候 任务列表应该是 smartProject', async () => {
		const { searchTasks, filteredTasks } = useSearchTasks()
		await searchTasks('写代码')

		expect(filteredTasks.value[0].item.done).toBe(true)
		expect(filteredTasks.value[0].item.from?.name).toBe(completeSmartProject.name)
	})

	test('reset 功能', async () => {
		const { searchTasks, filteredTasks, resetSearchTasks } = useSearchTasks()
		await searchTasks('吃饭')
		expect(filteredTasks.value.length).toBe(1)

		await resetSearchTasks()
		expect(filteredTasks.value.length).toBe(0)
	})
})
