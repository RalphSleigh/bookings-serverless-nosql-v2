import React from "react";

type OptionA = { option: 'A', AData: {}}
type OptionB = { option: 'B', BData: {}}
type Options = OptionA | OptionB


type OptionConfigElement<T extends Options> = React.FC<{
    data: T;
}>

interface OptionConfig<T extends Options> {
    ConfigElement: OptionConfigElement<T>;
}

class OptionAConfig implements OptionConfig<OptionA> {
    ConfigElement: OptionConfigElement<OptionA> = ({ data }) => {
        return (
            <div>
                <p>{data.option}</p>
            </div>
        );
    };
}

class OptionBConfig implements OptionConfig<OptionB> {
    ConfigElement: OptionConfigElement<OptionB> = ({ data }) => {
        return (
            <div>
                <p>{data.option}</p>
            </div>
        );
    };
}

function getOptionConfig(option: Options["option"]) {
    if(option === 'A') return new OptionAConfig()
    return new OptionBConfig()
}

function ExampleComponent() {
    const [option, setOption] = React.useState<OptionA | OptionB>({ option: 'A', AData: {} });
    
    // Example usage of the configuration element
    const OptionConfig = getOptionConfig(option.option);
    
    return (
        <div>
            <OptionConfig.ConfigElement data={option as never}/>
        </div>
    );
}