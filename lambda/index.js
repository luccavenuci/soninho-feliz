/* *
 * Soninho Feliz - Skill Alexa
 * Reproduz audio contínuo de piano instrumental suave + som de chuva.
 * Utiliza o Audio API da Alexa para streaming em loop.
 * */
const Alexa = require('ask-sdk-core');

/* *
 * URL https estavel do arquivo piano-rain.mp3 (Amazon S3).
 * A URL NAO pode expirar (pre-signed URL expira em 1 min e inviabiliza
 * o streaming continuo).
 * */
const AUDIO_URL = 'https://soninho-feliz-audio.s3.us-east-1.amazonaws.com/piano-rain.mp3';

// Token fixo para identificar o stream nos callbacks do AudioPlayer.
const STREAM_TOKEN = 'piano-rain';

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Iniciando Soninho Feliz. Aproveite este momento de tranquilidade.';
        return playAudio(handlerInput, speakOutput);
    }
};

const PlayMusicIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayMusicIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Tocando Soninho Feliz.';
        return playAudio(handlerInput, speakOutput);
    }
};

/**
 * Inicia a reproducao (REPLACE_ALL) com um texto de confirmacao.
 */
function playAudio(handlerInput, speakOutput) {
    return handlerInput.responseBuilder
        .speak(speakOutput)
        .addAudioPlayerPlayDirective('REPLACE_ALL', AUDIO_URL, STREAM_TOKEN, 0)
        .getResponse();
}

/**
 * Responde aos eventos do AudioPlayer (loop continuo via ENQUEUE).
 */
const AudioPlayerHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope).startsWith('AudioPlayer.');
    },
    handle(handlerInput) {
        const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);

        if (requestType === 'AudioPlayer.PlaybackNearlyFinished') {
            // Enfileira o mesmo audio de novo -> loop continuo.
            return handlerInput.responseBuilder
                .addAudioPlayerPlayDirective('ENQUEUE', AUDIO_URL, STREAM_TOKEN, 0)
                .getResponse();
        }

        if (requestType === 'AudioPlayer.PlaybackFailed') {
            // Falha de streaming reportada pelo device. Nao expoem mensagem ao usuario.
        }

        return handlerInput.responseBuilder.getResponse();
    }
};

/**
 * Controla os comandos de playback emitidos pelos botoes do dispositivo.
 */
const PlaybackControllerHandler = {
    canHandle(handlerInput) {
        const type = Alexa.getRequestType(handlerInput.requestEnvelope);
        return type.startsWith('PlaybackController.');
    },
    handle(handlerInput) {
        const type = Alexa.getRequestType(handlerInput.requestEnvelope);
        if (type === 'PlaybackController.Pause') {
            return handlerInput.responseBuilder
                .addAudioPlayerStopDirective()
                .getResponse();
        }
        // Play / Next / Previous retomam a reproducao (sem fala, so audio).
        return handlerInput.responseBuilder
            .addAudioPlayerPlayDirective('REPLACE_ALL', AUDIO_URL, STREAM_TOKEN, 0)
            .getResponse();
    }
};

const PauseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.PauseIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .addAudioPlayerStopDirective()
            .getResponse();
    }
};

const ResumeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ResumeIntent';
    },
    handle(handlerInput) {
        // Retoma a reproducao (reinicia do inicio de forma simplificada).
        return handlerInput.responseBuilder
            .addAudioPlayerPlayDirective('REPLACE_ALL', AUDIO_URL, STREAM_TOKEN, 0)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Diga abrir Soninho Feliz para iniciar o som de piano e chuva.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .addAudioPlayerStopDirective()
            .speak('Soninho Feliz encerrado. Até logo.')
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Não entendi. Diga tocar soninho feliz para iniciar a música.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

/**
 * Captura erros reportados pelo device (ex.: falha ao tocar o audio).
 * Apenas responde vazio - nao exibe mensagem ao usuario.
 */
const SystemExceptionHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'System.ExceptionEncountered';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Desculpe, ocorreu um problema. Tente novamente.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        PlayMusicIntentHandler,
        AudioPlayerHandler,
        PlaybackControllerHandler,
        PauseIntentHandler,
        ResumeIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        SystemExceptionHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('soninho-feliz/1.0.0')
    .lambda();