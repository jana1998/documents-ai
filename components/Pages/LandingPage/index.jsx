import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Page from '../../Page';
import PostAPI from '../../Util/PostAPI';
import Go from '../../Go';

import s from './index.less';

type Props = {
    history: Object,
};

const ContextSnippet = ({ context, index }) => {
    const [collapsed, setCollapsed] = useState(true);

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    const preview =
        context.text.slice(0, 222) + (context.text.length > 222 ? '...' : '');

    return (
        <div className={s.contextSnippet}>
            <h4 onClick={toggleCollapse}>
                Context {index + 1}
                <span className={s.title}>
                    {context.title}
                    <span className={s.arrow}>{collapsed ? '▼' : '▲'}</span>
                </span>
            </h4>
            <div className={collapsed ? s.collapsed : s.expanded}>
                {collapsed ? preview : context.text}
            </div>
        </div>
    );
};

const ResponseDisplay = ({ response }) => {
    return (
        <div className={s.responseDisplay}>
            <div className={s.answer}>{response.answer}</div>
            <div className={s.contexts}>
                {response.context.map((context, index) => (
                    <ContextSnippet
                        key={index}
                        context={context}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
};

const LandingPage = (props: Props): React.Node => {
    const [question, setQuestion] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [failedFiles, setFailedFiles] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [apiKeyApplied, setApiKeyApplied] = useState(false);

    React.useEffect(() => {
        const savedApiKey = localStorage.getItem('openai-api-key');
        if (savedApiKey) {
            setApiKeyApplied(true);
        }
    }, []);

    const handleAskQuestion = () => {
        // Perform question submission here
        // Set loading state to true
        setLoading(true);
        console.log('Asking question:', question);

        PostAPI.questions
            .submitQuestion(question, 'GPT Turbo')
            .promise.then((response) => {
                console.log('Response:', response);
                setResponse(response);
                setLoading(false);
            })
            .catch((error) => {
                console.log('Error asking question:', error);
                setErrorMessage(
                    error ? JSON.stringify(error) : 'Error asking question'
                );
                setResponse(null);
                setLoading(false);
            });
    };

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && !loading && question) {
                handleAskQuestion();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [loading, question]);

    const handleFileUpload = (files) => {
        setUploadedFiles([]);
        setFailedFiles({});
        setErrorMessage('');
        setLoading(true);

        PostAPI.upload
            .uploadFiles(files)
            .promise.then((response) => {
                console.log('Response:', response);
                setUploadedFiles(response.successful_file_names ?? []);
                setFailedFiles(response.failed_file_names ?? {});
                setLoading(false);
            })
            .catch((error) => {
                console.log('Error uploading files:', error);
                setErrorMessage(
                    error?.message
                        ? 'Error: ' + error?.message
                        : 'Error uploading files'
                );
                setUploadedFiles([]);
                setFailedFiles({});
                setLoading(false);
            });
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: handleFileUpload,
        multiple: true,
    });

    const failedFilenames = Object.keys(failedFiles);

    const handleApplyKey = () => {
        localStorage.setItem('openai-api-key', apiKey); // Save the new UUID to local storage
        setApiKeyApplied(true);
    };

    return (
        <Page
            pageClass={s.page}
            contentBackgroundClass={s.background}
            contentPreferredWidth={1300}
            contentClass={s.pageContent}>
            <div className={s.text}>
                
                {errorMessage && <div className={s.error}>{errorMessage}</div>}
                <div className={s.workArea}>
                    <div className={s.leftColumn}>
                        <div
                            {...getRootProps()}
                            className={[
                                s.dropzone,
                                loading ? s.dropzoneLoading : '',
                            ].join(' ')}>
                            <input {...getInputProps()} disabled={loading} />
                            <p>
                                {loading
                                    ? 'Loading...'
                                    : 'Drag and drop files to add to the knowledgebase here, or click to select files'}
                            </p>
                        </div>
                        <div className={s.questionInput}>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Enter your question here..."
                            />
                            <button
                                onClick={handleAskQuestion}
                                disabled={loading || !question}
                                className={
                                    loading
                                        ? s.askQuestionDisabled
                                        : s.askQuestion
                                }>
                                Submit
                            </button>
                            {loading && <div className={s.loader} />}
                        </div>
                        {!apiKeyApplied && (
                            <div className={s.questionInput}>
                                <input
                                    type="text"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your OpenAI API key here..."
                                />
                                <button
                                    onClick={handleApplyKey}
                                    className={s.askQuestion}>
                                    Apply
                                </button>
                            </div>
                        )}
                        {!apiKeyApplied && (
                            <div className={s.tokenCount}>
                                To get an API key, visit the{' '}
                                <Go to="https://platform.openai.com/account/api-keys">
                                    <span
                                        style={{
                                            fontWeight: 900,
                                            textDecoration: 'underline',
                                        }}>
                                        OpenAI API Keys Page
                                    </span>
                                </Go>
                            </div>
                        )}
                        {response?.tokens && (
                            <div className={s.tokenCount}>
                                TOTAL TOKENS USED:{' '}
                                <span style={{ fontWeight: 900 }}>
                                    {response.tokens}
                                </span>
                            </div>
                        )}
                        {response && <ResponseDisplay response={response} />}
                        <div style={{ height: 32 }} />
                        <div className={s.fileList}>
                            {uploadedFiles.length > 0 && (
                                <div className={s.successfulFiles}>
                                    <h4>Uploaded Files:</h4>
                                    <ul>
                                        {uploadedFiles.map((file, index) => (
                                            <li key={index}>{file}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {failedFilenames.length > 0 && (
                                <div className={s.failedFiles}>
                                    <h4>Failed Files:</h4>
                                    <ul>
                                        {failedFilenames.map((file, index) => (
                                            <li key={index}>
                                                {file}
                                                <div>
                                                    Reason: {failedFiles[file]}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default LandingPage;
