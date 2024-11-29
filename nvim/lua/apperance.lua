-- ui.lua - 简化的 Neovim 外观配置

-- 确保支持真彩色
vim.opt.termguicolors = true

-- 设置透明背景
vim.cmd [[
    highlight Normal guibg=NONE ctermbg=NONE
    highlight NonText guibg=NONE ctermbg=NONE
    highlight LineNr guibg=NONE ctermbg=NONE
    highlight SignColumn guibg=NONE ctermbg=NONE
    highlight EndOfBuffer guibg=NONE ctermbg=NONE
]]

-- 启用行号和光标线
vim.opt.number = true
vim.opt.cursorline = true

