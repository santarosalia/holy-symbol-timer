'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function Home() {
    const LEFT_TIME = {
        symbol: 120,
        lore: 240,
    };

    const [type, setType] = useState<'symbol' | 'lore'>('symbol');
    const [timeLeft, setTimeLeft] = useState(LEFT_TIME.symbol);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [alarmTime, setAlarmTime] = useState('');
    const [isAlarmActive, setIsAlarmActive] = useState(false);
    const [audio] = useState(
        typeof window !== 'undefined' ? new Audio('/notification.mp3') : null
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === ' ') {
                e.preventDefault();
                resetTimer();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [type]);

    useEffect(() => {
        switch (type) {
            case 'symbol':
                setTimeLeft(LEFT_TIME.symbol);
                break;
            case 'lore':
                setTimeLeft(LEFT_TIME.lore);
        }
    }, [type]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && !isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => {
                    const newTime = prevTime - 1;

                    // 알람 시간에 도달했을 때
                    if (alarmTime && newTime === parseInt(alarmTime) && !isAlarmActive) {
                        setIsAlarmActive(true);
                        if (audio) {
                            const playAudio = () => {
                                audio.currentTime = 0; // 오디오를 처음으로 되돌림
                                audio
                                    .play()
                                    .catch((e) => console.log('오디오 재생 실패:', e));
                            };

                            // 즉시 첫 번째 재생
                            playAudio();

                            // 1초 후 두 번째 재생
                            setTimeout(() => {
                                playAudio();
                            }, 500);
                        }
                        if (window.ipcRenderer) {
                            window.ipcRenderer.invoke(
                                'show-toast',
                                '알람 시간!',
                                '설정한 시간이 되었습니다!'
                            );
                        }
                    }

                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isRunning, isPaused, timeLeft, alarmTime, isAlarmActive, audio]);

    // 알람 효과를 위한 깜빡임 효과
    useEffect(() => {
        let blinkInterval: NodeJS.Timeout;

        if (isAlarmActive) {
            blinkInterval = setInterval(() => {
                // 깜빡임 효과는 CSS 애니메이션으로 처리
            }, 500);
        }

        return () => {
            if (blinkInterval) {
                clearInterval(blinkInterval);
            }
        };
    }, [isAlarmActive]);

    const startTimer = () => {
        setIsRunning(true);
        setIsPaused(false);
        setIsAlarmActive(false); // 타이머 시작시 알람 비활성화
    };

    const pauseTimer = () => {
        setIsPaused(true);
        setIsAlarmActive(false);
    };

    const resumeTimer = () => {
        setIsPaused(false);
    };

    const resetTimer = () => {
        switch (type) {
            case 'symbol':
                setTimeLeft(LEFT_TIME.symbol);
                break;
            case 'lore':
                setTimeLeft(LEFT_TIME.lore);
        }
        setIsRunning(true);
        setIsPaused(false);
        setIsAlarmActive(false); // 리셋시 알람 비활성화
        if (window.ipcRenderer) {
            window.ipcRenderer.invoke(
                'show-toast',
                '타이머 리셋',
                '타이머가 리셋되었습니다!'
            );
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
            .toString()
            .padStart(2, '0')}`;
    };

    useEffect(() => {
        const handleKeyboardShortcut = (
            event: Electron.IpcRendererEvent,
            action: string
        ) => {
            switch (action) {
                case 'reset':
                    resetTimer();
                    break;
            }
        };

        // Electron 키보드 단축키 이벤트 리스너 등록
        if (window.ipcRenderer) {
            window.ipcRenderer.on('keyboard-shortcut', handleKeyboardShortcut);
        }

        // 컴포넌트 언마운트시 이벤트 리스너 제거
        return () => {
            if (window.ipcRenderer) {
                window.ipcRenderer.off('keyboard-shortcut', handleKeyboardShortcut);
            }
        };
    }, [isRunning, isPaused, type]);

    const onClickDownload = () => {
        const a = document.createElement('a');
        a.href = '/김망히 홀심 타이머-Windows-1.0.0-Setup.exe';
        a.download = '/김망히 홀심 타이머-Windows-1.0.0-Setup.exe';
        a.click();
    };
    const toggleType = () => {
        const newType = type === 'symbol' ? 'lore' : 'symbol';
        setType(newType);
    };

    const videioSection = () => {
        switch (type) {
            case 'symbol': {
                return (
                    <div
                        className="flex mb-8 flex-col "
                        style={{ backgroundColor: '#bebebe' }}
                    >
                        <div className="flex justify-center">
                            <video
                                src="/holysymbol.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-1/2 h-1/2"
                            />
                        </div>
                        <div className="flex justify-center ">
                            <Image
                                src="/manghi85.png"
                                alt="manghi"
                                width={100}
                                height={100}
                                className="mb-3"
                            />
                        </div>
                        <div className="flex justify-center items-center ml-5">
                            <Image
                                src="/무지개구름l.png"
                                width={23}
                                height={0}
                                alt="무지개"
                            ></Image>
                            <span
                                className="flex h-[21px] text-xs text-white false false"
                                style={{
                                    backgroundImage: 'url(/무지개구름c.png)',
                                    paddingTop: 3,
                                }}
                            >
                                김망히
                            </span>
                            <Image
                                src="/무지개구름r.png"
                                width={21}
                                height={0}
                                alt="무지개"
                            ></Image>
                        </div>
                    </div>
                );
            }

            case 'lore': {
                return (
                    <div
                        className="flex mb-8 flex-col h-60"
                        style={{ backgroundColor: '#000000' }}
                    >
                        <div className="flex justify-center ">
                            <video
                                src="/lore.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-1/2"
                            />
                        </div>
                    </div>
                );
            }
        }
    };
    return (
        <div
            className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-all duration-300 ${
                isAlarmActive ? 'animate-pulse' : ''
            }`}
        >
            <div
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md transition-all duration-300 ${
                    isAlarmActive ? 'animate-pulse bg-red-100 dark:bg-red-900/30' : ''
                }`}
            >
                <div>
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-1 flex">
                            <button
                                onClick={toggleType}
                                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                                    type === 'symbol'
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                                }`}
                            >
                                홀심 (2분)
                            </button>
                            <button
                                onClick={toggleType}
                                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                                    type === 'lore'
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                                }`}
                            >
                                로어 (4분)
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClickDownload}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-4"
                >
                    다운로드
                    <div className="text-center text-xs">
                        다운로드 시 백그라운드에서 단축 키 사용이 가능합니다.
                    </div>
                </button>
                {videioSection()}
                <div className="flex items-center justify-center mb-6">
                    <input
                        type="number"
                        placeholder="몇초 남았을때 알려줄까요?"
                        min={0}
                        max={type === 'symbol' ? LEFT_TIME.symbol : LEFT_TIME.lore}
                        value={alarmTime}
                        onChange={(e) => setAlarmTime(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                </div>
                <div className="text-center mb-8">
                    <div
                        className={`text-6xl font-mono font-bold transition-all duration-300 ${
                            isAlarmActive
                                ? 'text-red-600 dark:text-red-400 animate-pulse'
                                : 'text-indigo-600 dark:text-indigo-400'
                        } mb-4`}
                    >
                        {formatTime(timeLeft)}
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-1000 ease-linear ${
                                isAlarmActive
                                    ? 'bg-red-600 animate-pulse'
                                    : 'bg-indigo-600'
                            }`}
                            style={{
                                width: `${
                                    (((type === 'symbol'
                                        ? LEFT_TIME.symbol
                                        : LEFT_TIME.lore) -
                                        timeLeft) /
                                        (type === 'symbol'
                                            ? LEFT_TIME.symbol
                                            : LEFT_TIME.lore)) *
                                    100
                                }%`,
                            }}
                        ></div>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    {!isRunning ? (
                        <button
                            onClick={startTimer}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            시작
                        </button>
                    ) : (
                        <>
                            {isPaused ? (
                                <button
                                    onClick={resumeTimer}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                                >
                                    재개
                                </button>
                            ) : (
                                <button
                                    onClick={pauseTimer}
                                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                                >
                                    일시정지
                                </button>
                            )}
                        </>
                    )}

                    <button
                        onClick={resetTimer}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                    >
                        리셋 (Ctrl + Space)
                    </button>
                </div>
                {timeLeft === 0 && (
                    <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                        <p className="text-red-800 dark:text-red-200 text-center font-semibold">
                            ⏰ 시간이 종료되었습니다!
                        </p>
                    </div>
                )}
                {isAlarmActive && (
                    <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg animate-pulse">
                        <p className="text-yellow-800 dark:text-yellow-200 text-center font-semibold">
                            🔔 알람 시간입니다!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
