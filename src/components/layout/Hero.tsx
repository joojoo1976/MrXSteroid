import React, { useState } from 'react';
import { Download, Pause, Play, Volume2, Lock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ContentStrings, PricingTier } from '../../types';
import BrandLogo from '../shared/BrandLogo';
import DynamicBrandLogo from './DynamicBrandLogo';
import { StyledBrandName } from '../shared/StyledBrandName';

import { usePreferences } from '../../context/PreferencesContext';

interface HeroProps {
  content: ContentStrings;
  openCheckout: (tier: PricingTier) => void;
  playerState: { isPlaying: boolean; togglePlay: () => void; };
}

// Internal BookCover Component to keep Hero self-contained
const BookCover: React.FC<{ content: ContentStrings, onClick: () => void }> = ({ content, onClick }) => {
  const { language: lang, isRTL } = usePreferences();
  const getDefaultImg = () => {
    return isRTL ? "/cover-ar.webp" : "/cover-en.webp";
  };
  const [imgSrc, setImgSrc] = useState<string>(getDefaultImg());
  const [retryCount, setRetryCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleError = () => {
    const base = isRTL ? "/cover-ar" : "/cover-en";
    if (retryCount === 0) { setImgSrc(`${base}.jpg`); setRetryCount(1); }
    else if (retryCount === 1) { setImgSrc(`${base}.png`); setRetryCount(2); }
    else if (retryCount === 2) { setImgSrc("https://placehold.co/600x900/18181b/EAB308?text=MR+X+STEROID&font=oswald"); setRetryCount(3); }
  };

  return (
    <div className="relative w-72 md:w-[24rem] aspect-[2/3] mx-auto my-12 group cursor-pointer z-20 [perspective:1500px]" onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gold-500/20 blur-[60px] rounded-full opacity-60 transition-all duration-700 ${isFlipped ? 'opacity-30 scale-90' : 'group-hover:opacity-100'}`}></div>
      <div className={`relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(-180deg)]' : 'group-hover:[transform:rotateY(-10deg)_rotateX(5deg)]'}`}>
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden] z-20">
          <div className={`relative w-full h-full ${isRTL ? 'rounded-l-xl rounded-r-sm' : 'rounded-r-xl rounded-l-sm'} shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-background ${isRTL ? 'border-l' : 'border-r'} border-t border-b border-zinc-700 overflow-hidden`}>
            <div className={`absolute top-[2px] bottom-[2px] ${isRTL ? 'right-0' : 'left-0'} w-4 bg-gradient-to-r ${isRTL ? 'from-zinc-600 to-zinc-800' : 'from-zinc-800 to-zinc-600'} ${isRTL ? 'rounded-r-sm' : 'rounded-l-sm'} z-10 ${isRTL ? 'border-r' : 'border-l'} border-zinc-600`}></div>
            <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} bg-gold-500 text-black text-xs font-black px-2 py-1 rounded-sm z-30 shadow-md uppercase tracking-wider`}>
              {content.heroEditions[lang as keyof typeof content.heroEditions]}
            </div>
            <div className={`absolute inset-0 ${isRTL ? 'mr-4' : 'ml-4'} bg-zinc-900 ${isRTL ? 'rounded-l-xl' : 'rounded-r-xl'} overflow-hidden relative z-20 ${isRTL ? 'border-r' : 'border-l'} border-zinc-800 h-full p-1`}>
              <img loading="lazy" key={imgSrc} src={imgSrc} alt="Mr. X Steroid Book Cover" className={`w-full h-full object-fill ${isRTL ? 'rounded-l-lg' : 'rounded-r-lg'}`} onError={handleError} />
            </div>
            <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${isRTL ? 'rounded-l-xl mr-4' : 'rounded-r-xl ml-4'} z-30`}></div>
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] z-10">
          <div className={`w-full h-full ${isRTL ? 'rounded-r-xl rounded-l-sm' : 'rounded-l-xl rounded-r-sm'} bg-zinc-900 border border-zinc-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col p-1 relative overflow-hidden`}>
            <div className={`flex-1 bg-background ${isRTL ? 'rounded-r-lg rounded-l-sm ml-4' : 'rounded-l-lg rounded-r-sm mr-4'} border border-zinc-800 relative overflow-hidden p-6 flex flex-col items-center justify-between`}>
              <div className="relative z-20 text-center"><div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700"><Lock className="w-6 h-6 text-gold-500" /></div><h3 className="text-xl font-black text-white mb-1">SECRET PROTOCOLS</h3></div>
              <div className="relative z-20 w-full pt-4"><button onClick={(e) => { e.stopPropagation(); onClick(); }} className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-black font-black text-base uppercase tracking-wider rounded-lg shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2">BUY NOW</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AudioPlayer: React.FC<{ content: ContentStrings, playerState: { isPlaying: boolean, togglePlay: () => void } }> = ({ content, playerState }) => {
  const { isRTL } = usePreferences();
  return (
    <div className={`mt-8 p-4 bg-zinc-100 dark:bg-background rounded-2xl flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      <button aria-label={playerState.isPlaying ? "Pause Audio" : "Play Audio"} title={playerState.isPlaying ? "Pause Audio" : "Play Audio"} onClick={playerState.togglePlay} className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform shrink-0">
        {playerState.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
      </button>
      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h4 className="font-bold text-base text-zinc-900 dark:text-white">{content.audioPlayer.title}</h4>
        <p className="text-sm text-zinc-500">{content.audioPlayer.subtitle}</p>
      </div>
      <div className="text-sm font-mono font-bold text-zinc-400 shrink-0">{content.audioPlayer.duration}</div>
    </div>
  );
};

const Hero: React.FC<HeroProps> = ({ content, openCheckout, playerState }) => {
  const { language: lang, isRTL } = usePreferences();
  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-zinc-200/50 dark:bg-grid-white/5 [mask-image:linear-gradient(0deg,white,transparent)] pointer-events-none" />

      {/* Animated Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 blur-[120px] rounded-full animate-float-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-float-slow [animation-delay:-2s]"></div>

      <div className="container mx-auto text-center relative z-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mb-8"
        >
          <h1 className="mb-6 pb-2 inline-block relative">
            <DynamicBrandLogo
              variant="full"
              inline={false}
              className="text-6xl md:text-8xl lg:text-[10rem] filter drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.dispatchEvent(new CustomEvent('mrx_navigate', { detail: 'home' }));
              }}
            />
            <div className="absolute -inset-8 bg-gold-500/10 blur-3xl rounded-full -z-10 animate-pulse"></div>
          </h1>

        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-gold-600 to-zinc-900 dark:from-white dark:via-gold-400 dark:to-white max-w-4xl mx-auto mb-12 leading-relaxed animate-text-flash text-center px-2"
        >
          <StyledBrandName text={content.heroSubtitle} />
        </motion.p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mb-16 flex-wrap px-4">
          <div className="relative w-full sm:w-auto flex flex-col items-center">
            <motion.button
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openCheckout(content.pricingTiers[0])}
              className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-black border-2 border-transparent font-black text-xl rounded-full transition-all shadow-[0_0_40px_rgba(234,179,8,0.4)] hover:shadow-[0_0_60px_rgba(234,179,8,0.6)] animate-glow relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {content.heroCta}
                <CheckCircle className="w-6 h-6 animate-pulse" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
            </motion.button>
            <span className="text-xs font-mono text-gold-500 mt-2 tracking-widest uppercase opacity-80 animate-pulse">2-Step Fast Checkout</span>
          </div>

          <motion.a
            whileHover={{ scale: 1.05 }}
            href={isRTL ? "/Example_MrXSteroid_Book_Ar.pdf" : "/Example_MrXSteroid_Book.pdf"}
            download
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white border-2 border-zinc-200 dark:border-zinc-800 hover:border-gold-500 dark:hover:border-gold-500 font-black text-lg md:text-xl rounded-2xl md:rounded-full transition-all flex items-center justify-center gap-3 group glass-morphism shadow-lg"
          >
            <Download className="w-5 h-5 md:w-6 md:h-6 group-hover:text-gold-500 group-hover:animate-bounce transition-colors" />
            {content.downloadPreview}
          </motion.a>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={playerState.togglePlay}
            className={`w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 border-2 font-black text-lg md:text-xl rounded-2xl md:rounded-full transition-all flex items-center justify-center gap-3 group relative overflow-hidden ${playerState.isPlaying ? 'bg-gold-500 border-gold-500 text-black shadow-xl' : 'bg-transparent text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800 hover:border-gold-500'}`}
          >
            {playerState.isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />}
            {content.audioPreviewBtn}
            {playerState.isPlaying && (
              <div className="absolute bottom-0 left-0 h-1 bg-black/20 animate-progress w-full"></div>
            )}
          </motion.button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gold-500/20 blur-[100px] rounded-full -z-10 animate-float-slow"></div>
          <BookCover content={content} onClick={() => openCheckout(content.pricingTiers[0])} />
        </div>

        <div className="max-w-md mx-auto mt-12 animate-float-slow">
          <AudioPlayer content={content} playerState={playerState} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
