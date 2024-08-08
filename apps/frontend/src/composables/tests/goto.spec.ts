import { describe, expect, it, vi } from 'vitest'
import { GITHUB_URL,openGithub, useGoto } from '../goto'
import { useSetup } from '@/tests/helper'
import { RouteNames } from '@/router/const'

describe('the header', () => {
  it('使用路由跳转 Home 页面', () => {
    const { router } = useSetup(() => {
      const { gotoHome } = useGoto()
      gotoHome()
    })

    expect(router.push).toBeCalledWith({ name: RouteNames.HOME })
  })

  it('使用路由跳转 Settings 页面', () => {
    const { router } = useSetup(() => {
      const { gotoSettings } = useGoto()

      gotoSettings()
    })

    expect(router.push).toBeCalledWith({ name: RouteNames.SETTINGS })
  })

  it('跳转 github 页面', async () => {
    window.open = vi.fn()

    openGithub()

    expect(window.open).toBeCalledWith(GITHUB_URL)
  })
})
