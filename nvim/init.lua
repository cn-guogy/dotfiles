local config_path = vim.fn.stdpath("config") .. "/lua/config/"
package.path = config_path .. "?.lua;" .. package.path

require("config.lazy")
require("config.keymaps")
