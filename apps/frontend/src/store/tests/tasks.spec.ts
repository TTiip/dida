import { describe, expect, test, vi, beforeEach } from "vitest"
import { TaskStatus, useTasksStore } from "../tasks"
import { liveListProject } from "@/tests/fixture"
import { fetchCreateTask } from "@/api"
import { createPinia, setActivePinia } from "pinia"
import { useTasksSelectorStore } from "../tasksSelector"
import { completeSmartProject } from "../smartProjects"

vi.mock('@/api')
vi.mocked(fetchCreateTask).mockImplementation(async (title: string) => {
	return {
		title,
		content: '这是 content',
		status: TaskStatus.ACTIVE,
		projectId: '1',
		position: 1,
		_id: '1',
		createdAt: new Date().toString(),
		updatedAt: new Date().toString()
	}
})

describe('tasks store', () => {
	beforeEach(() => {
		setActivePinia(createPinia())

		// 重置 mock
		// vi.mocked(fetchCreateTask).mockClear()
		// 重置所有的 mock
		vi.clearAllMocks()
	})

	test('添加task 当前的 currentActiveTask 是一个 undefined 的时候不应该添加', async () => {
		const taskSelectorStore = useTasksSelectorStore()

		const taskStore = useTasksStore()
		taskSelectorStore.currentSelector = undefined

		const task = await taskStore.addTask('吃饭')

		expect(task).toBeUndefined()
		expect(taskStore.tasks.length).toBe(0)
		expect(taskStore.currentActiveTask).toBeUndefined()
		expect(fetchCreateTask).not.toBeCalled()
	})

	test('添加task 当前的 currentActiveTask 类型是一个 smartProject 的时候不应该添加', async () => {
		const taskSelectorStore = useTasksSelectorStore()

		const taskStore = useTasksStore()
		taskSelectorStore.currentSelector = completeSmartProject

		const task = await taskStore.addTask('吃饭')

		expect(task).toBeUndefined()
		expect(taskStore.tasks.length).toBe(0)
		expect(taskStore.currentActiveTask).toBeUndefined()
		expect(fetchCreateTask).not.toBeCalled()
	})

	test('添加task 应当在列表的最前面', async () => {
		const taskSelectorStore = useTasksSelectorStore()

		const taskStore = useTasksStore()
		taskSelectorStore.currentSelector = liveListProject

		await taskStore.addTask('吃饭')
		const task1 = await taskStore.addTask('运动')

		expect(task1?.title).toBe('运动')
		expect(taskStore.tasks.length).toBe(2)
		expect(taskStore.tasks[0]).toEqual(task1)
		expect(taskStore.currentActiveTask).toEqual(task1)
		expect(fetchCreateTask).toBeCalledWith(task1?.title, liveListProject.id)
	})
})
