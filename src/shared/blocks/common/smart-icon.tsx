import { ComponentType, lazy, Suspense } from 'react';
import {
  RiAddLine,
  RiBarChart2Line,
  RiChat2Line,
  RiClapperboardAiLine,
  RiCloudy2Fill,
  RiCloudyFill,
  RiCodeFill,
  RiDatabase2Line,
  RiDeleteBinLine,
  RiDiscordFill,
  RiEditLine,
  RiEyeLine,
  RiFlashlightFill,
  RiGithubFill,
  RiGoogleFill,
  RiImage2Line,
  RiKey2Fill,
  RiKeyLine,
  RiLockPasswordLine,
  RiMessage2Line,
  RiMusic2Line,
  RiNextjsFill,
  RiQuestionLine,
  RiRefreshLine,
  RiRobot2Line,
  RiTaskLine,
  RiTwitterXFill,
  RiVideoLine,
} from 'react-icons/ri';

const iconCache: { [key: string]: ComponentType<any> } = {};
const remixIconMap: Record<string, ComponentType<any>> = {
  RiAddLine,
  RiBarChart2Line,
  RiChat2Line,
  RiClapperboardAiLine,
  RiCloudy2Fill,
  RiCloudyFill,
  RiCodeFill,
  RiDatabase2Line,
  RiDeleteBinLine,
  RiDiscordFill,
  RiEditLine,
  RiEyeLine,
  RiFlashlightFill,
  RiGithubFill,
  RiGoogleFill,
  RiImage2Line,
  RiKey2Fill,
  RiKeyLine,
  RiLockPasswordLine,
  RiMessage2Line,
  RiMusic2Line,
  RiNextjsFill,
  RiQuestionLine,
  RiRefreshLine,
  RiRobot2Line,
  RiTaskLine,
  RiTwitterXFill,
  RiVideoLine,
};

// Function to automatically detect icon library
function detectIconLibrary(name: string): 'ri' | 'lucide' {
  if (name && name.startsWith('Ri')) {
    return 'ri';
  }

  return 'lucide';
}

export function SmartIcon({
  name,
  size = 24,
  className,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
  [key: string]: any;
}) {
  const library = detectIconLibrary(name);
  const cacheKey = `${library}-${name}`;

  if (library === 'ri') {
    const IconComponent = remixIconMap[name] || RiQuestionLine;

    return <IconComponent size={size} className={className} {...props} />;
  }

  if (!iconCache[cacheKey]) {
    if (library === 'lucide') {
      // Lucide React (default)
      iconCache[cacheKey] = lazy(async () => {
        try {
          const module = await import('lucide-react');
          const IconComponent = module[name as keyof typeof module];
          if (IconComponent) {
            return { default: IconComponent as ComponentType<any> };
          } else {
            console.warn(
              `Icon "${name}" not found in lucide-react, using fallback`
            );
            return { default: module.HelpCircle as ComponentType<any> };
          }
        } catch (error) {
          console.error(`Failed to load lucide-react:`, error);
          const fallbackModule = await import('lucide-react');
          return { default: fallbackModule.HelpCircle as ComponentType<any> };
        }
      });
    }
  }

  const IconComponent = iconCache[cacheKey];

  return (
    <Suspense fallback={<div style={{ width: size, height: size }} />}>
      <IconComponent size={size} className={className} {...props} />
    </Suspense>
  );
}
