#!/bin/bash

# 批量重命名hooks文件为kebab-case格式
# 使用方法: ./scripts/rename-hooks-to-kebab-case.sh

HOOKS_DIR="src/core/hooks"

echo "开始重命名hooks文件为kebab-case格式..."

# 定义需要重命名的文件映射
declare -A file_mapping=(
    ["useAgentChat.ts"]="use-agent-chat.ts"
    ["useAgentForm.ts"]="use-agent-form.ts"
    ["useAgents.ts"]="use-agents.ts"
    ["useMemberSelection.ts"]="use-member-selection.ts"
    ["useMessageList.ts"]="use-message-list.ts"
    ["useDiscussionMembers.ts"]="use-discussion-members.ts"
    ["useDiscussions.ts"]="use-discussions.ts"
    ["useMessages.ts"]="use-messages.ts"
    ["useSettings.ts"]="use-settings.ts"
    ["useSettingCategories.ts"]="use-setting-categories.ts"
    ["useDiscussion.ts"]="use-discussion.ts"
    ["useOptimisticUpdate.ts"]="use-optimistic-update.ts"
    ["useKeyboardExpandableList.ts"]="use-keyboard-expandable-list.ts"
    ["useMediaQuery.ts"]="use-media-query.ts"
    ["useMessageInput.ts"]="use-message-input.ts"
    ["useObservableState.ts"]="use-observable-state.ts"
    ["usePersistedState.ts"]="use-persisted-state.ts"
    ["useViewportHeight.ts"]="use-viewport-height.ts"
    ["useWindowSize.ts"]="use-window-size.ts"
    ["useAutoScroll.ts"]="use-auto-scroll.ts"
    ["useBreakpoint.ts"]="use-breakpoint.ts"
)

# 重命名文件
for old_name in "${!file_mapping[@]}"; do
    new_name="${file_mapping[$old_name]}"
    old_path="$HOOKS_DIR/$old_name"
    new_path="$HOOKS_DIR/$new_name"
    
    if [ -f "$old_path" ]; then
        echo "重命名: $old_name → $new_name"
        mv "$old_path" "$new_path"
    else
        echo "警告: 文件不存在 $old_path"
    fi
done

echo "文件重命名完成！"
echo ""
echo "接下来需要更新所有import语句。"
echo "请运行以下命令来查找所有需要更新的import:"
echo "grep -r 'from.*use[A-Z]' src/ --include='*.ts' --include='*.tsx'"
echo ""
echo "然后手动更新这些import语句。" 