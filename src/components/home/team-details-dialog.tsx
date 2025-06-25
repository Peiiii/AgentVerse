import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AGENT_COMBINATIONS } from "@/core/config/agents";
import { useAgents } from "@/core/hooks/useAgents";

// 定义TeamMember和TeamConfig接口
interface TeamMember {
  id: string;
  role: string;
  expertise: string[];
}

interface TeamConfig {
  id: string;
  name: string;
  members: TeamMember[];
}

interface TeamDetailsDialogProps {
  team: TeamConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamDetailsDialog({
  team,
  open,
  onOpenChange,
}: TeamDetailsDialogProps) {
  const { getAgentAvatar, agents } = useAgents();
  
  // 查找代理的头像
  const getAvatar = (memberId: string, memberRole: string) => {
    // 先尝试通过ID查找
    const agent = agents.find(a => a.id === memberId);
    if (agent) {
      return getAgentAvatar(agent.id);
    }
    
    // 如果找不到，尝试通过名称查找
    const agentByName = agents.find(a => a.name === memberRole);
    if (agentByName) {
      return getAgentAvatar(agentByName.id);
    }
    
    // 在预设组合中查找
    for (const combination of Object.values(AGENT_COMBINATIONS)) {
      // 检查主持人
      if (combination.moderator.name === memberRole) {
        return combination.moderator.avatar;
      }
      
      // 检查参与者
      for (const participant of combination.participants) {
        if (participant.name === memberRole) {
          return participant.avatar;
        }
      }
    }
    
    // 如果都找不到，返回默认头像
    return "/avatars/default.png";
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{team.name}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {team.members.map((member) => (
              <div key={member.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                    <img 
                      src={getAvatar(member.id, member.role)} 
                      alt={member.role}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 如果头像加载失败，使用默认头像
                        (e.target as HTMLImageElement).src = "/avatars/default.png";
                      }}
                    />
                  </div>
                  <h3 className="font-medium">{member.role}</h3>
                </div>
                
                {member.expertise.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">专长领域</h4>
                    <div className="flex flex-wrap gap-1">
                      {member.expertise.map((skill, index) => (
                        <span 
                          key={index}
                          className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 