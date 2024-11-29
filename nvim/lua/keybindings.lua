-- General Keybindings
local keymap = vim.api.nvim_set_keymap

-- Leader key 设置
vim.g.mapleader = "<C>"

-- 快捷键配置
local opts = { noremap = true, silent = true }

keymap('n','<C-e>',':NvimTreeToggle<CR>',opts)
keymap('n', '<C-`>', ':bo term<CR>:resize 10<CR>', opts)


