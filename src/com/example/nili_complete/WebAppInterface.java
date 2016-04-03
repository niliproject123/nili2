package com.example.nili_complete;

import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.webkit.JavascriptInterface;

public class WebAppInterface extends Thread
{
	private	MainActivity 	mainActivity;
	private Operator		operator;
	private String jsMessage;
	public Handler mHandler;
	
	public void run()
	{
		Thread.currentThread().setName("WebAppInterface");
		Looper.prepare();
		
		mHandler = new Handler() {
			public void handleMessage(Message message)
			{
				if(message.arg1 == Commands.WebApp.liftFingers)
				{
					eventLiftFingers();
					return;
				}
				if(message.arg1 == Commands.WebApp.eventPressedCorrect)
				{
					pressedCorrect_Animation(addJsDelimeters((String)message.obj));
					return;
				}
				if(message.arg1 == Commands.WebApp.sendStringToJs)
				{
					sendPositionStringToJs(addJsDelimeters((String)message.obj));
					return;
				}
				if(message.arg1 == Commands.WebApp.eventUiChangeMode)
				{
					changeMode(addJsDelimeters((String)message.obj));
					return;
				}
				if(message.arg1 == Commands.WebApp.eventForward)
				{
					eventForward();
					return;
				}
				if(message.arg1 == Commands.WebApp.eventBackward)
				{
					eventBackward();
					return;
				}
			}
		};
		
		Looper.loop();
	}
	
	public void set(MainActivity mainActivity, Operator operator)
	{
		this.mainActivity = mainActivity;
		this.operator = operator;
	}
	
	public WebAppInterface()
	{
	}

	public void sendPositionStringToJs(String positionString)
	{
		sendMessageToJs(String.format("receivePositionStringFromAndroid(%s);", positionString));
	}

	public void eventLiftFingers() 
	{
		sendMessageToJs("eventLiftFingers()");
	}


	public void pressedCorrect_Animation(String positionString) 
	{
		sendMessageToJs(String.format("eventPressedCorrect(%s);", positionString));
	}

	public void performStop() 
	{
		sendMessageToJs("eventStop()");
	}

	public void sendMessageToJs(String message)
	{
		this.jsMessage = message;
		this.mainActivity.runOnUiThread(new Runnable() 
		{
			@Override
			public void run() 
			{
				WebAppInterface.this.mainActivity.webView.evaluateJavascript(WebAppInterface.this.jsMessage, null);
			}
		});
	}
	
	
	@JavascriptInterface
	public void messageFromJs(String chordString) 
	{
		Message operatorMessage = new Message();
		if(chordString.equalsIgnoreCase("start_chords"))
		{
			operatorMessage.arg1 = Commands.Operator.restart;
			this.operator.mHandler.sendMessage(operatorMessage);
			return;
		}
		
		if(chordString.equalsIgnoreCase("end_chords"))
		{
			operatorMessage.arg1 = Commands.Operator.finishedAddingChords;
			this.operator.mHandler.sendMessage(operatorMessage);
			return;
		} 
		
		else if(chordString.indexOf("addChord_")!=-1)
		{
			operatorMessage.arg1 = Commands.Operator.addChord;
			operatorMessage.obj = chordString.split("_")[1];
		}

		this.operator.mHandler.sendMessage(operatorMessage);
	}

	private String addJsDelimeters(String string)
	{
		return "\"" + string + "\"";
	}

	private void changeMode(String isAuto)
	{
		sendMessageToJs("setMode(" + isAuto + ");");
	}
	
	private void eventForward()
	{
		sendMessageToJs("eventForward();");
	}
	
	private void eventBackward()
	{
		sendMessageToJs("eventBackward();");
	}
}
