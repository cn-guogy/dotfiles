vim.cmd([[packadd packer.nvim]])

return require('packer').startup(function()
	use 'wbthomason/packer.nvim'
	use 'kyazdani42/nvim-tree.lua'
  	use 'hrsh7th/nvim-cmp'
	use 'hrsh7th/nvim-lspconfig'
	use 'hrsh7th/cmp-nvim-lsp'
	use {
		event = 'VimEnter',
		'nvimdev/dashboard-nvim',
		config = function()
			require('dashboard').setup{
			  db.setup({
    theme = 'hyper',
    config = {
      week_header = {
       enable = true,
      },
      shortcut = {
        { desc = '󰊳 Update', group = '@property', action = 'Lazy update', key = 'u' },
        {
          icon = ' ',
          icon_hl = '@variable',
          desc = 'Files',
          group = 'Label',
          action = 'Telescope find_files',
          key = 'f',
        },
        {
          desc = ' Apps',
          group = 'DiagnosticHint',
          action = 'Telescope app',
          key = 'a',
        },
        {
          desc = ' dotfiles',
          group = 'Number',
          action = 'Telescope dotfiles',
          key = 'd',
        },
      },
    },
  })
			}
		end,
		requires = {'nvim-tree/nvim-web-devicons'},
}
end)

