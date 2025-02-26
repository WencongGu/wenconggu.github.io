---
title: My NeoVim [deprecated]
date: 2024-10-01 12:11:17
tags: NeoVim
---

[deprecated]

配置文件。

<!--more-->

### nvim in vscode

vscode可以使用neovim插件，功能相对于vim插件少了些。而且作为插件的二者，寄存器、全局替换、`:%g/`等功能都十分受限，有点遗憾。

neovim插件相对于vim插件有一点我很喜欢，就是neovim能够丝滑地在行间切换，就是说在一行中不断地左右移动光标能够移出当前行，但vim插件还是传统那种模式限制在一行中的模式有点不爽。

配置文件可以自己写，只要指定启动时加载的文件就行

```json
"vscode-neovim.neovimInitVimPaths.darwin": "~/.config/nvim/init_vscodenvim.lua",
```

比如vim插件可以指定打开文件后的默认模式，而nvim不支持，但是可以在init.lua文件中使用feedkeys这个built-in方程让它自己键入i来实现直接进入插入模式。

设置总体上还是很受限，但是够用。

```lua
local opt = vim.opt

-- Tab
opt.tabstop = 4 -- number of visual spaces per TAB
opt.softtabstop = 4 -- number of spacesin tab when editing
opt.shiftwidth = 4 -- insert 4 spaces on a tab
opt.expandtab = true -- tabs are spaces, mainly because of python

-- Searching
opt.incsearch = true -- search as characters are entered
opt.hlsearch = true -- do not highlight matches
opt.ignorecase = true -- ignore case in searches by default
opt.smartcase = true -- but make it case sensitive if an uppercase is entered

opt.showmode = true
opt.showcmd = true

vim.g.mapleader = " "

local keymap = vim.keymap.set
local opts = { noremap = true }

keymap("n", ";", ":", opts)
keymap("n", ":", "<cmd>echo 'Changed to : (colon) !'<CR>", opts)

vim.cmd "call feedkeys('i')"
```

---

neovim配置与vim配置的转化在[官方文档](https://neovim.io/doc/user/lua.html#Lua)中可查，或者在neovim中使用:h lua-guide命令查看。

插件的使用是从B站众多视屏中抄的作业。

### 配置结构：

```
.config/ 
    |- nvim/ 
        |- init.lua 
        |- lua/ 
            |- options.lua : 基础配置
            |- keymaps.lua : 键盘映射
            |- XDG_print.lua : neovim一些工作目录
            |- lazyvim.lua : lazy.vim，nevoim当下最流行的插件管理器
            |- plugins/ : 由lazyvim管理的所有插件
                |- lualine.lua : 底部状态栏
                |- bufferline.lua : 
                |- tokyonight.lua :
                |- nvimtree.lua :
                |- treesitter.lua :
```

### 文件内容：

#### init.lua
```lua
-- init.lua 

-- require("XDG_print")

require("options")
require("keymaps")
require("lazyvim")

```
#### lua/
##### optins.lua
```lua
-- lua/options.lua

local opt = vim.o

opt.number = true
opt.relativenumber = true

opt.autoindent = true -- ai
opt.smartindent = true -- si

opt.wrap = true
opt.linebreak = true -- 不在单词中间换行

opt.ruler = true
opt.cursorline = true
opt.termguicolors = true
opt.signcolumn = "yes"
opt.visualbell = true

opt.hidden = true

opt.hlsearch = true
opt.incsearch = true
opt.ignorecase = true
opt.smartcase = true

opt.laststatus = 2
opt.showmatch = true
opt.showcmd = true
opt.showmode = true
opt.wildmenu = true             

opt.clipboard = 'unnamedplus' -- use system clipboard
opt.mouse = 'a'

opt.tabstop = 4 -- number of visual spaces per TAB
opt.softtabstop = 4 -- number of spacesin tab when editing
opt.shiftwidth = 4 -- insert 4 spaces on a tab
opt.expandtab = true -- tabs are spaces, mainly because of python

opt.scrolloff = 5

opt.virtualedit = "all" -- 光标可以显示在所有地方，包括没有字符的地方，在可视化块中尤其有用

opt.syntax = "ON"
vim.g.color = "slate"

-- lua调用vimscript
-- vim.cmd “set number”

```
##### keymaps.lua
```lua
-- lua/keymaps.lua

-- vim.g.mapleader=" " -- leader键用空格会方便一些，在lazyvim.lua里面也设置了。

local keymap = vim.keymap.set 
local opts = { noremap = true, }

-- 快速移动选中的代码，类似vs code中的<Alt/option-↑/↓>，快速移动整行
keymap("v", "<A-j>", ":m '>+1<CR>gv=gv", opts)
keymap("v", "<A-k>", ":m '<-2<CR>gv=gv", opts)

keymap('n', '<leader>e', ':NvimTreeToggle<CR>', opts)
```
##### XDG_print.lua
```lua
-- lua/XDG_print.lua

local stdpath = vim.fn.stdpath

print("$XDG_CONFIG_HOME: ",stdpath("config"))

print("$XDG_DATA_HOME: ",stdpath("data"))

print("$XDG_RUNTIME_DIR: ",stdpath("run"))

print("$XDG_CACHE_HOME: " ,stdpath("cache"))

print("$XDG_STATE_HOME: " ,stdpath("state"))

print("$XDG_LOG_FILE: " ,stdpath("log"))

local xgddatadirs = stdpath("data_dirs")
for key,path in pairs(xgddatadirs) do
print("$XDG_DATA_FILE: " ,path)
end

local xdgconfigdirs = stdpath("config_dirs")
for key, path in pairs(xdgconfigdirs) do
print("$XDG_CONFIG_DIRS: ", path)
end
```
##### lazyvim.lua
```lua
-- lua/lazyvim.lua

-- Bootstrap lazy.nvim
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not (vim.uv or vim.loop).fs_stat(lazypath) then
  local lazyrepo = "https://github.com/folke/lazy.nvim.git"
  local out = vim.fn.system({ "git", "clone", "--filter=blob:none", "--branch=stable", lazyrepo, lazypath })
  if vim.v.shell_error ~= 0 then
    vim.api.nvim_echo({
      { "Failed to clone lazy.nvim:\n", "ErrorMsg" },
      { out, "WarningMsg" },
      { "\nPress any key to exit... " },
    }, true, {})
    vim.fn.getchar()
    os.exit(1)
  end
end
vim.opt.rtp:prepend(lazypath)

-- Make sure to setup `mapleader` and `maplocalleader` before
-- loading lazy.nvim so that mappings are correct.
-- This is also a good place to setup other settings (vim.opt)
vim.g.mapleader = " "
vim.g.maplocalleader = "\\"

-- Setup lazy.nvim
require("lazy").setup({
  spec = {
    -- import your plugins
    { import = "plugins" },
  },
  -- Configure any other settings here. See the documentation for more details.
  -- colorscheme that will be used when installing plugins.
  install = { colorscheme = { "habamax" } },
  -- automatically check for plugin updates
  checker = { enabled = true },
})
```
##### plugins/
###### lualine.lua
```lua
-- lua/plugins/lualine.lua

return {
    'nvim-lualine/lualine.nvim',
    dependencies = { 'nvim-tree/nvim-web-devicons' },
    config = function()
        require('lualine').setup({
        options = { theme = 'tokyonight', }
        })
    end,
}
```
###### bufferline.lua
```lua
-- lua/plugins/bufferline.lua

return {
    'akinsho/bufferline.nvim', 
    version = "*", 
    dependencies = 'nvim-tree/nvim-web-devicons',
    config=function()
        vim.opt.termguicolors = true,
        require("bufferline").setup()
    end,
}
```
###### tokyonight.lua
```lua
-- lua/plugings/tokyonight.lua

return {
    "folke/tokyonight.nvim",
    lazy = false,
    priority = 1000,
    opts = {},
    config=function()
        vim.cmd[[colorscheme tokyonight-moon]]
        require("tokyonight").setup({
            -- use the night style
            style = "night",
            -- disable italic for functions
            styles = { functions = {} },
            -- Change the "hint" color to the "orange" color, and make the "error" color bright red
            on_colors = function(colors)
                colors.hint = colors.orange
                colors.error = "#ff0000"
            end
        })
    end,
}
```
###### nvim-tree.lua
```lua
-- lua/plugings/nvim-tree.lua

return {
    "nvim-tree/nvim-tree.lua",
    version = "*",
    lazy = false,
    dependencies = { "nvim-tree/nvim-web-devicons", },
    config = function()
        require("nvim-tree").setup {}
    end,
}
```
###### treesitter.lua
```lua
-- lua/plugings/treesitter.lua

return {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    config = function () 
      local configs = require("nvim-treesitter.configs")

      configs.setup({
          ensure_installed = { "c", "lua", "vim", "vimdoc", "query", "elixir", "heex", "javascript", "html", },
          sync_install = false,
          highlight = { enable = true },
          indent = { enable = true },  
          rainbow = {
            enabled = true,
            extend_mode = true,
            max_file_lines = nil,
          }
        })
    end,
 }
```

>日积月累
