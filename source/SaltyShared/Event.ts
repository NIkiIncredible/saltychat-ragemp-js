class Event{
// #region Plugin
    public SaltyChat_Initialize: string = "SaltyChat_Initialize";
    public SaltyChat_CheckVersion: string = "SaltyChat_CheckVersion";
    public SaltyChat_UpdateClient: string = "SaltyChat_UpdateClient";
    public SaltyChat_Disconnected: string = "SaltyChat_Disconnected";
// #endregion

// #region State Change
    public SaltyChat_TalkStateChanged: string = "SaltyChat_TalkStateChanged";
    public SaltyChat_MicStateChanged: string = "SaltyChat_MicStateChanged";
    public SaltyChat_MicEnabledChanged: string = "SaltyChat_MicEnabledChanged";
    public SaltyChat_SoundStateChanged: string = "SaltyChat_SoundStateChanged";
    public SaltyChat_SoundEnabledChanged: string = "SaltyChat_SoundEnabledChanged";
// #endregion

// #region Player State
    public SaltyChat_PlayerDied: string = "SaltyChat_PlayerDied";
    public SaltyChat_PlayerRevived: string = "SaltyChat_PlayerRevived";
// #endregion

// #region Proximity
    public SaltyChat_SetVoiceRange: string = "SaltyChat_SetVoiceRange";
// #endregion

// #region Phone
    public SaltyChat_EstablishedCall: string = "SaltyChat_EstablishedCall";
    public SaltyChat_EstablishedCallRelayed: string = "SaltyChat_EstablishedCallRelayed";
    public SaltyChat_EndCall: string = "SaltyChat_EndCall";
// #endregion

// #region Radio
    public SaltyChat_SetRadioChannel: string = "SaltyChat_SetRadioChannel";
    public SaltyChat_IsSending: string = "SaltyChat_IsSending";
    public SaltyChat_IsSendingRelayed: string = "SaltyChat_IsSendingRelayed";
    public SaltyChat_UpdateRadioTowers: string = "SaltyChat_UpdateRadioTowers";
// #endregion

// #region Megaphone
    public SaltyChat_IsUsingMegaphone: string = "SaltyChat_IsUsingMegaphone ";

// #endregion
}
export default new Event();
