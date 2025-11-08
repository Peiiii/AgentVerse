import { IconRegistry } from '@/common/components/common/icon-registry';
import { useIconStore } from '@/core/stores/icon.store';
import { MessageCircle, Settings, Users, Github } from 'lucide-react';

export function IconStoreDemo() {
  const { addIcon, removeIcon } = useIconStore();

  const handleRegisterIcons = () => {
    // 注册一些图标
    addIcon('message', MessageCircle);
    addIcon('settings', Settings);
    addIcon('users', Users);
    addIcon('github', Github);
  };

  const handleUnregisterIcon = () => {
    removeIcon('github');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">图标注册系统演示</h2>
        <p className="text-gray-600 mb-4">
          这是一个配置化场景的图标系统，适用于需要动态配置图标的场景。
          对于静态图标，建议直接使用 Lucide 图标组件。
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={handleRegisterIcons}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            注册图标
          </button>
          <button
            onClick={handleUnregisterIcon}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            注销 GitHub 图标
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">使用 IconRegistry（配置化）</h3>
            <div className="flex gap-2 items-center">
              <IconRegistry id="message" />
              <span>Message</span>
            </div>
            <div className="flex gap-2 items-center">
              <IconRegistry id="settings" />
              <span>Settings</span>
            </div>
            <div className="flex gap-2 items-center">
              <IconRegistry id="users" />
              <span>Users</span>
            </div>
            <div className="flex gap-2 items-center">
              <IconRegistry id="github" />
              <span>GitHub</span>
            </div>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">直接使用 Lucide 图标（静态）</h3>
            <div className="flex gap-2 items-center">
              <MessageCircle className="w-4 h-4" />
              <span>Message</span>
            </div>
            <div className="flex gap-2 items-center">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </div>
            <div className="flex gap-2 items-center">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </div>
            <div className="flex gap-2 items-center">
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800 mb-2">使用建议</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>IconRegistry</strong>：适用于需要动态配置、主题切换、国际化等场景</li>
            <li>• <strong>直接使用 Lucide 图标</strong>：适用于静态、固定的图标需求</li>
            <li>• 不要强制替换所有图标，根据实际需求选择合适的方案</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 