-- plugin-config/nvim-cmp.lua

-- 引入 nvim-cmp 和 nvim-lspconfig
local cmp = require'cmp'
local lspconfig = require'lspconfig'

-- 配置 nvim-cmp 插件
cmp.setup({
  sources = {
    { name = 'nvim_lsp' },  -- 启用 LSP 补全
    { name = 'buffer' },    -- 缓冲区补全
    { name = 'path' },      -- 文件路径补全
  },
  mapping = {
    ['<Tab>'] = cmp.mapping.select_next_item({ behavior = cmp.SelectBehavior.Insert }),  -- Tab 补全
    ['<S-Tab>'] = cmp.mapping.select_prev_item({ behavior = cmp.SelectBehavior.Insert }),  -- Shift-Tab 补全
    ['<CR>'] = cmp.mapping.confirm({ select = true }),  -- Enter 键确认补全
  },
  formatting = {
    format = function(entry, vim_item)
      vim_item.menu = ({
        nvim_lsp = '[LSP]',
        buffer = '[Buffer]',
        path = '[Path]',
      })[entry.source.name]
      return vim_item
    end
  }
})

-- 配置 LSP
-- 示例：配置 pyright (Python LSP)
lspconfig.pyright.setup{}

-- 你可以根据需要配置其他语言服务器

