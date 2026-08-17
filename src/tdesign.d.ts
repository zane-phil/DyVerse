import 'tdesign-vue-next'

declare module 'vue' {
  export interface GlobalComponents {
    TButton: typeof import('tdesign-vue-next')['Button']
    TTextarea: typeof import('tdesign-vue-next')['Textarea']
    TTag: typeof import('tdesign-vue-next')['Tag']
    TAvatar: typeof import('tdesign-vue-next')['Avatar']
    TImage: typeof import('tdesign-vue-next')['Image']
    TDivider: typeof import('tdesign-vue-next')['Divider']
    TTooltip: typeof import('tdesign-vue-next')['Tooltip']
    TSkeleton: typeof import('tdesign-vue-next')['Skeleton']
    TEmpty: typeof import('tdesign-vue-next')['Empty']
    TSwitch: typeof import('tdesign-vue-next')['Switch']
  }
}
