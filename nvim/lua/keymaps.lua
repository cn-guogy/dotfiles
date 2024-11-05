-- 设置快捷键alt+e来切换nvim-tree
vim.api.nvim_set_keymap('n', '<A-e>', ':NvimTreeToggle<CR>', { noremap = true, silent = true })
-- 设置快捷键alt+上下左右箭头在窗口间移动
vim.api.nvim_set_keymap('n', '<A-Up>', '<C-w>k', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<A-Down>', '<C-w>j', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<A-Left>', '<C-w>h', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<A-Right>', '<C-w>l', { noremap = true, silent = true })

-- 设置Alt+Q快捷键来打开终端
vim.api.nvim_set_keymap('n', '<A-q>', ":split | resize 10 | terminal<CR>", { noremap = true, silent = true })
vim.opt.splitbelow = true
