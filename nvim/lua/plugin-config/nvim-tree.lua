-- plugin-config/nvim-tree.lua

-- 配置 nvim-tree 插件
require('nvim-tree').setup({
  -- 禁用图标
  renderer = {
    icons = {
      show = {
        file = false,
        folder = false,
        folder_arrow = false,
      },
    },
  },
  
  -- 禁止抢占光标
  view = {
    centralize_selection = false,  -- 不自动居中选择
    width = 30,                     -- 文件树宽度
    side = 'left',                  -- 文件树显示在左侧
  },
})

