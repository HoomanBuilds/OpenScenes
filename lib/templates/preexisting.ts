import { Project } from '@/lib/storage/types';

/**
 * Pre-existing templates for new users
 * Enhanced versions of the Neo-Tokyo Comics and Smart Animation templates
 */

const COMIC_STYLE_PROJECT: Project = {
  id: `template_comic_${Date.now()}`,
  name: '🎬 Comic Style Presentation',
  description: 'Dynamic comic-style presentation with dramatic panels, bold typography, and cinematic transitions. Perfect for storytelling and tech narratives.',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  status: 'draft',
  data: {
    themeId: 'minimal_dark',
    slides: [
      {
        id: 'comic-cover',
        type: 'title',
        duration: 6000,
        background: {
          type: 'color',
          value: '#ffffff'
        },
        elements: [
          {
            id: 'speed-lines-bg',
            type: 'shape',
            content: 'rect',
            x: 0,
            y: 0,
            width: 1000,
            height: 562,
            color: 'transparent',
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)',
            zIndex: 0
          },
          {
            id: 'hero-panel-large',
            type: 'shape',
            content: 'rect',
            x: 380,
            y: -50,
            width: 800,
            height: 700,
            color: '#ef4444',
            rotation: 12,
            zIndex: 1,
            animation: {
              type: 'slide',
              direction: 'right',
              duration: 0.5,
              delay: 0
            }
          },
          {
            id: 'main-title-comic',
            type: 'headline',
            content: 'THE\nJOURNEY',
            x: 40,
            y: 120,
            width: 650,
            height: 400,
            fontSize: 140,
            fontWeight: 'bold',
            fontFamily: 'Bebas Neue',
            textColor: '#1a1a1a',
            textAlign: 'left',
            lineHeight: 0.9,
            zIndex: 2,
            animation: {
              type: 'pop',
              duration: 0.4,
              delay: 0.2
            }
          },
          {
            id: 'subtitle-issue',
            type: 'text',
            content: 'CHAPTER 1',
            x: 60,
            y: 70,
            width: 250,
            height: 40,
            fontSize: 28,
            fontWeight: 'bold',
            fontFamily: 'Bebas Neue',
            textColor: '#ef4444',
            zIndex: 3
          },
          {
            id: 'action-bubble',
            type: 'shape',
            content: 'rect',
            x: 700,
            y: 360,
            width: 260,
            height: 140,
            color: '#ffffff',
            strokeWidth: 8,
            strokeColor: '#1a1a1a',
            borderRadius: 0,
            zIndex: 3,
            animation: {
              type: 'scale',
              duration: 0.4,
              delay: 0.6
            }
          },
          {
            id: 'bubble-text-content',
            type: 'text',
            content: 'BEGIN\nNOW!',
            x: 710,
            y: 385,
            width: 240,
            height: 110,
            fontSize: 52,
            fontWeight: 'bold',
            fontFamily: 'Bebas Neue',
            textColor: '#1a1a1a',
            textAlign: 'center',
            lineHeight: 1,
            zIndex: 4
          }
        ]
      },
      {
        id: 'comic-panel-multi',
        type: 'problem',
        duration: 7000,
        background: {
          type: 'color',
          value: '#1a1a1a'
        },
        elements: [
          {
            id: 'panel-top-left',
            type: 'shape',
            content: 'rect',
            x: 10,
            y: 10,
            width: 480,
            height: 270,
            color: '#ffffff',
            strokeWidth: 8,
            strokeColor: '#ef4444',
            zIndex: 1,
            animation: {
              type: 'slide',
              direction: 'left',
              duration: 0.35,
              delay: 0.1
            }
          },
          {
            id: 'panel-top-left-title',
            type: 'headline',
            content: 'THE CHALLENGE',
            x: 25,
            y: 25,
            width: 450,
            height: 60,
            fontSize: 52,
            fontFamily: 'Bebas Neue',
            textColor: '#1a1a1a',
            zIndex: 2
          },
          {
            id: 'panel-top-left-text',
            type: 'text',
            content: 'Every great story begins with an obstacle. What barriers stand in your way?',
            x: 35,
            y: 95,
            width: 430,
            height: 160,
            fontSize: 18,
            fontFamily: 'Lato',
            textColor: '#1a1a1a',
            lineHeight: 1.5,
            zIndex: 2
          },
          {
            id: 'panel-top-right',
            type: 'shape',
            content: 'rect',
            x: 510,
            y: 10,
            width: 480,
            height: 270,
            color: '#ef4444',
            strokeWidth: 8,
            strokeColor: '#ffffff',
            zIndex: 1,
            animation: {
              type: 'slide',
              direction: 'right',
              duration: 0.35,
              delay: 0.2
            }
          },
          {
            id: 'panel-top-right-text',
            type: 'headline',
            content: 'IMPACT',
            x: 530,
            y: 100,
            width: 440,
            height: 120,
            fontSize: 80,
            fontFamily: 'Bebas Neue',
            textColor: '#ffffff',
            textAlign: 'center',
            zIndex: 2
          },
          {
            id: 'panel-bottom',
            type: 'shape',
            content: 'rect',
            x: 10,
            y: 292,
            width: 980,
            height: 260,
            color: '#fde047',
            strokeWidth: 8,
            strokeColor: '#000000',
            zIndex: 1,
            animation: {
              type: 'slide',
              direction: 'up',
              duration: 0.35,
              delay: 0.3
            }
          },
          {
            id: 'panel-bottom-main',
            type: 'text',
            content: '"Transform obstacles into opportunities"',
            x: 30,
            y: 340,
            width: 940,
            height: 160,
            fontSize: 44,
            fontWeight: 'bold',
            fontFamily: 'Bebas Neue',
            textColor: '#1a1a1a',
            textAlign: 'center',
            lineHeight: 1.4,
            zIndex: 2
          }
        ]
      },
      {
        id: 'comic-hero-reveal',
        type: 'features',
        duration: 6000,
        background: {
          type: 'color',
          value: '#fbbf24'
        },
        elements: [
          {
            id: 'hero-stripe',
            type: 'shape',
            content: 'rect',
            x: 180,
            y: 0,
            width: 640,
            height: 562,
            color: '#ffffff',
            zIndex: 0
          },
          {
            id: 'hero-name-badge',
            type: 'headline',
            content: 'THE SOLUTION',
            x: 0,
            y: 460,
            width: 1000,
            height: 102,
            fontSize: 120,
            fontFamily: 'Bebas Neue',
            textColor: '#1a1a1a',
            textAlign: 'center',
            zIndex: 3,
            animation: {
              type: 'slide',
              direction: 'up',
              duration: 0.4,
              delay: 0.2
            }
          },
          {
            id: 'hero-stat-card',
            type: 'shape',
            content: 'rect',
            x: 30,
            y: 40,
            width: 320,
            height: 320,
            color: '#1a1a1a',
            strokeWidth: 8,
            strokeColor: '#ffffff',
            zIndex: 2,
            animation: {
              type: 'pop',
              duration: 0.4,
              delay: 0.4
            }
          },
          {
            id: 'hero-stat-title',
            type: 'headline',
            content: 'KEY STATS',
            x: 50,
            y: 60,
            width: 280,
            height: 50,
            fontSize: 36,
            fontFamily: 'Bebas Neue',
            textColor: '#ef4444',
            zIndex: 3
          },
          {
            id: 'hero-stats-content',
            type: 'text',
            content: '• 10x Performance\n• 99.9% Uptime\n• Zero Downtime\n• Enterprise Ready',
            x: 50,
            y: 120,
            width: 280,
            height: 220,
            fontSize: 22,
            fontFamily: 'Lato',
            textColor: '#ffffff',
            lineHeight: 1.8,
            zIndex: 3
          },
          {
            id: 'hero-highlight',
            type: 'shape',
            content: 'circle',
            x: 650,
            y: 40,
            width: 320,
            height: 320,
            color: '#ef4444',
            opacity: 0.85,
            zIndex: 1,
            animation: {
              type: 'scale',
              duration: 0.5,
              delay: 0.6
            }
          }
        ]
      }
    ]
  }
};

const MODERN_CARDS_PROJECT: Project = {
  id: `template_cards_${Date.now()}`,
  name: '✨ Modern Card Showcase',
  description: 'Elegant 3-card showcase with smooth animations and glassmorphism effects. Great for highlighting features, services, or key offerings.',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  status: 'draft',
  data: {
    themeId: 'minimal_dark',
    slides: [
      {
        id: 'cards-hero',
        type: 'default',
        duration: 5000,
        background: {
          type: 'color',
          value: '#000000'
        },
        elements: [
          {
            id: 'cards-container',
            type: 'custom',
            x: 0,
            y: 0,
            width: 1000,
            height: 562,
            zIndex: 10,
            content: {
              layout: {
                tag: 'div',
                className: 'w-full h-full flex items-center justify-center gap-10 perspective-[1000px] overflow-hidden px-8',
                children: [
                  {
                    id: 'card-1',
                    tag: 'div',
                    className: 'w-64 h-80 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700 rounded-2xl p-8 flex flex-col justify-between hover:border-red-500/50 transition-all duration-300',
                    children: [
                      {
                        tag: 'div',
                        className: 'w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500 font-bold text-lg',
                        text: '01'
                      },
                      {
                        tag: 'div',
                        children: [
                          {
                            tag: 'h2',
                            className: 'text-2xl font-bold text-white mb-3',
                            text: 'Design'
                          },
                          {
                            tag: 'p',
                            className: 'text-zinc-400 text-sm leading-relaxed',
                            text: 'Clean layouts and intuitive interfaces that users love.'
                          }
                        ]
                      },
                      {
                        tag: 'div',
                        className: 'h-1 w-8 bg-red-500 rounded-full'
                      }
                    ]
                  },
                  {
                    id: 'card-2',
                    tag: 'div',
                    className: 'w-64 h-80 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-600 rounded-2xl p-8 flex flex-col justify-between shadow-2xl hover:border-blue-500/50 transition-all duration-300 scale-105 relative z-20',
                    children: [
                      {
                        tag: 'div',
                        className: 'w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 font-bold text-lg',
                        text: '02'
                      },
                      {
                        tag: 'div',
                        children: [
                          {
                            tag: 'h2',
                            className: 'text-2xl font-bold text-white mb-3',
                            text: 'Develop'
                          },
                          {
                            tag: 'p',
                            className: 'text-zinc-300 text-sm leading-relaxed',
                            text: 'Modern tech stack with seamless implementation.'
                          }
                        ]
                      },
                      {
                        tag: 'div',
                        className: 'h-1 w-8 bg-blue-500 rounded-full'
                      }
                    ]
                  },
                  {
                    id: 'card-3',
                    tag: 'div',
                    className: 'w-64 h-80 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700 rounded-2xl p-8 flex flex-col justify-between hover:border-green-500/50 transition-all duration-300',
                    children: [
                      {
                        tag: 'div',
                        className: 'w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500 font-bold text-lg',
                        text: '03'
                      },
                      {
                        tag: 'div',
                        children: [
                          {
                            tag: 'h2',
                            className: 'text-2xl font-bold text-white mb-3',
                            text: 'Deploy'
                          },
                          {
                            tag: 'p',
                            className: 'text-zinc-400 text-sm leading-relaxed',
                            text: 'Fast, reliable deployment with zero downtime.'
                          }
                        ]
                      },
                      {
                        tag: 'div',
                        className: 'h-1 w-8 bg-green-500 rounded-full'
                      }
                    ]
                  }
                ]
              },
              animations: {
                'card-1': {
                  initial: { opacity: 0, x: -50, rotateY: -15 }
                },
                'card-2': {
                  initial: { opacity: 0, y: 50, scale: 0.9 }
                },
                'card-3': {
                  initial: { opacity: 0, x: 50, rotateY: 15 }
                }
              },
              timeline: [
                { label: 'Start' },
                { delay: 0.3 },
                {
                  id: 'card-1',
                  animate: { opacity: 1, x: 0, rotateY: 0 },
                  transition: { duration: 0.8, ease: 'backOut' }
                },
                {
                  id: 'card-2',
                  animate: { opacity: 1, y: 0, scale: 1 },
                  transition: { duration: 0.8, type: 'spring', bounce: 0.5 }
                },
                {
                  id: 'card-3',
                  animate: { opacity: 1, x: 0, rotateY: 0 },
                  transition: { duration: 0.8, ease: 'backOut' }
                }
              ]
            }
          }
        ]
      },
      {
        id: 'cards-stats',
        type: 'default',
        duration: 6000,
        background: {
          type: 'color',
          value: '#0a0a0a'
        },
        elements: [
          {
            id: 'stats-content',
            type: 'custom',
            x: 0,
            y: 0,
            width: 1000,
            height: 562,
            zIndex: 10,
            content: {
              layout: {
                tag: 'div',
                className: 'w-full h-full flex flex-col items-center justify-center gap-12',
                children: [
                  {
                    tag: 'h1',
                    className: 'text-5xl font-bold text-white text-center',
                    text: 'By The Numbers'
                  },
                  {
                    tag: 'div',
                    className: 'grid grid-cols-3 gap-8 w-full px-20',
                    children: [
                      {
                        tag: 'div',
                        className: 'text-center',
                        children: [
                          {
                            tag: 'div',
                            className: 'text-5xl font-black text-red-500 mb-2',
                            text: '10K+'
                          },
                          {
                            tag: 'p',
                            className: 'text-zinc-400 text-lg',
                            text: 'Happy Users'
                          }
                        ]
                      },
                      {
                        tag: 'div',
                        className: 'text-center',
                        children: [
                          {
                            tag: 'div',
                            className: 'text-5xl font-black text-blue-500 mb-2',
                            text: '99.9%'
                          },
                          {
                            tag: 'p',
                            className: 'text-zinc-400 text-lg',
                            text: 'Uptime'
                          }
                        ]
                      },
                      {
                        tag: 'div',
                        className: 'text-center',
                        children: [
                          {
                            tag: 'div',
                            className: 'text-5xl font-black text-green-500 mb-2',
                            text: '24/7'
                          },
                          {
                            tag: 'p',
                            className: 'text-zinc-400 text-lg',
                            text: 'Support'
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          }
        ]
      }
    ]
  }
};

export const PREEXISTING_TEMPLATES = [COMIC_STYLE_PROJECT, MODERN_CARDS_PROJECT];

export async function initializeTemplatesIfNeeded(
  projectsList: unknown[],
  saveProject: (project: Project) => Promise<void>
): Promise<void> {
  if (projectsList && projectsList.length === 0) {
    console.log('📚 Initializing templates for new user...');
    for (const template of PREEXISTING_TEMPLATES) {
      try {
        await saveProject(template);
        console.log(`✅ Loaded template: ${template.name}`);
      } catch (error) {
        console.error(`❌ Failed to load template: ${template.name}`, error);
      }
    }
  }
}
